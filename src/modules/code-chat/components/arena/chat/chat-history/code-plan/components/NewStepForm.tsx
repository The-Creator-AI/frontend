import React from 'react';
import { Input } from 'antd';

interface NewStepFormProps {
    type: 'code' | 'command';
    onAddStep: (type: 'code' | 'command', value: string) => void;
    onCancel: () => void;
}

export const NewStepForm: React.FC<NewStepFormProps> = ({ type, onAddStep, onCancel }) => {
    return (
        <div className="new-step-form">
            <Input
                placeholder={type === 'code' ? "Enter filename" : "Enter command"}
                onPressEnter={(e) => {
                    const value = (e.target as HTMLInputElement).value;
                    onAddStep(type, value);
                }}
                onBlur={onCancel}
            />
        </div>
    );
};