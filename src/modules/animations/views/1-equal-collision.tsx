import React, { useEffect, useRef, useState } from 'react';
import './1-equal-collision.scss';
import { FaCamera } from "react-icons/fa";

const BallCollisionAnimation = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [animationComplete, setAnimationComplete] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) {
            return;
        }

        canvas.width = 400;
        canvas.height = 300;

        const centerX = canvas.width / 2;
        const ball1 = { x: 50, y: 150, radius: 20, dx: 0.5, color: 'red', visible: true };
        const ball2 = { x: 350, y: 150, radius: 20, dx: -0.5, color: 'blue', visible: true };

        const camera = {
            x: 50,
            y: 50,
            width: 30,
            height: 20,
            lensWidth: 15,
            lensHeight: 10,
            color: 'green',
            lensColor: 'darkgreen',
            dx: 0.5  // Same speed as the initial red ball
        };

        let collided = false;

        function drawBall(ball) {
            if (ball.visible && ctx) {
                ctx.beginPath();
                ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
                ctx.fillStyle = ball.color;
                ctx.fill();
                ctx.closePath();
            }
        }

        function drawCamera() {
            if (!ctx) {
                return;
            }
            ctx.fillStyle = camera.color;
            ctx.fillRect(camera.x - camera.width / 2, camera.y - camera.height / 2, camera.width, camera.height);

            ctx.beginPath();
            ctx.moveTo(camera.x - camera.lensWidth / 2, camera.y + camera.height / 2);
            ctx.lineTo(camera.x + camera.lensWidth / 2, camera.y + camera.height / 2);
            ctx.lineTo(camera.x + camera.width / 2, camera.y + camera.height / 2 + camera.lensHeight);
            ctx.lineTo(camera.x - camera.width / 2, camera.y + camera.height / 2 + camera.lensHeight);
            ctx.closePath();
            ctx.fillStyle = camera.lensColor;
            ctx.fill();
        }

        function drawMeasurementArrow(startX, endX, y, color) {
            if (!ctx) {
                return;
            }
            const arrowHeight = 10;
            ctx.beginPath();
            ctx.moveTo(startX, y);
            ctx.lineTo(endX, y);
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.stroke();

            // Draw arrowheads
            ctx.beginPath();
            ctx.moveTo(startX, y - arrowHeight / 2);
            ctx.lineTo(startX, y + arrowHeight / 2);
            ctx.lineTo(startX + arrowHeight / 2, y);
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(endX, y - arrowHeight / 2);
            ctx.lineTo(endX, y + arrowHeight / 2);
            ctx.lineTo(endX - arrowHeight / 2, y);
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.fill();

            // Draw distance text
            const distance = Math.abs(endX - startX);
            ctx.font = '12px Arial';
            ctx.fillStyle = color;
            ctx.textAlign = 'center';
            ctx.fillText(`${distance.toFixed(0)}px`, (startX + endX) / 2, y - 5);
        }

        function animate() {
            if (!canvas || !ctx) {
                return;
            }
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            drawBall(ball1);
            drawBall(ball2);
            drawCamera();

            // Draw measurement arrows
            if (ball1.visible) {
                drawMeasurementArrow(centerX, ball1.x, ball1.y + 40, ball1.color);
            }
            if (ball2.visible) {
                drawMeasurementArrow(centerX, ball2.x, ball2.y + 40, ball2.color);
            }

            // Move balls
            if (ball1.visible) ball1.x += ball1.dx;
            if (ball2.visible) ball2.x += ball2.dx;

            // Move camera
            camera.x += camera.dx;

            if (!collided) {
                const distance = Math.sqrt(Math.pow(ball2.x - ball1.x, 2) + Math.pow(ball2.y - ball1.y, 2));
                if (distance <= ball1.radius + ball2.radius) {
                    ball1.dx *= -1;
                    ball2.dx *= -1;
                    collided = true;
                }
            }

            if (ball1.x - ball1.radius > canvas.width) ball1.visible = false;
            if (ball2.x + ball2.radius < 0) ball2.visible = false;

            if (!ball1.visible && !ball2.visible) {
                setAnimationComplete(true);
                return;
            }

            requestAnimationFrame(animate);
        }

        animate();
    }, []);

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <canvas ref={canvasRef} className="border border-gray-300 rounded-lg shadow-lg mb-4"></canvas>
            <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-red-500"></div>
                <span>Red Ball</span>
                <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                <span>Blue Ball</span>
                <FaCamera size={16} className="text-green-500" />
                <span>Camera</span>
            </div>
            {animationComplete && (
                <div className="mt-4 text-lg font-semibold text-gray-700">
                    Animation Complete
                </div>
            )}
        </div>
    );
};

export default BallCollisionAnimation;