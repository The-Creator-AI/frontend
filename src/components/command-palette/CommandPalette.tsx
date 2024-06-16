import React, { useEffect, useRef, useState } from 'react';
import './CommandPalette.scss';

export interface Command<T> {
    id: string;
    title: string;
    description: string;
    data?: T
}

interface CommandPaletteProps<T> {
    placeholder?: string;
    commands: Command<T>[];
    onSelect: (command: Command<T>) => void;
    position?: 'top' | 'bottom' | 'center'; // Add position prop
    isOpen: boolean;
}

const MAX_COMMANDS = 20;

const CommandPalette = <T, >({ placeholder, commands, onSelect, isOpen, position = 'center' }: CommandPaletteProps<T>) => {
    const [filteredCommands, setFilteredCommands] = useState(commands);
    const [searchTerm, setSearchTerm] = useState('');
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const highlightedElement = document.querySelector('.command-item.highlighted');
        if (highlightedElement) {
            highlightedElement.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
            });
        }
    }, [highlightedIndex]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (isOpen) {
                switch (event.key) {
                    case 'ArrowUp':
                        event.preventDefault();
                        setHighlightedIndex((prevIndex) =>
                            Math.max(0, prevIndex - 1)
                        );
                        break;
                    case 'ArrowDown':
                        event.preventDefault();
                        setHighlightedIndex((prevIndex) =>
                            Math.min(filteredCommands.length - 1, prevIndex + 1)
                        );
                        break;
                    case 'Enter':
                        event.preventDefault();
                        if (filteredCommands[highlightedIndex]) {
                            onSelect(filteredCommands[highlightedIndex]);
                            setSearchTerm('');
                            setHighlightedIndex(0);
                        }
                        break;
                    default:
                        break;
                }
            }
        };

        // Add and remove the event listener
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [filteredCommands, highlightedIndex, isOpen, onSelect]);


    useEffect(() => {
        // Autofocus input when Command Palette opens
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    useEffect(() => {
        setFilteredCommands(
            commands.filter(
                (command) =>
                    command.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    command.description.toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
        setHighlightedIndex(0); // Reset highlighted index when search term changes
    }, [searchTerm, commands]);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const handleCommandSelect = (command: Command<T>) => {
        onSelect(command);
        setSearchTerm('');
    };

    // Calculate vertical position based on the 'position' prop
    const verticalPosition = position === 'top' ? { top: '10px' } : position === 'bottom' ? { bottom: '10px' } : { top: '50%' };
    const transformValue = position === 'center' ? 'translate(-50%, -50%)' : 'translateX(-50%)';

    return (
        <div className="command-palette" style={{
            display: isOpen ? 'block' : 'none',
            ...verticalPosition,
            transform: transformValue,
        }}>
            <div className="command-palette-header">
                <input
                    type="search"
                    placeholder={placeholder || 'Start typing to search...'}
                    value={searchTerm}
                    onChange={handleInputChange}
                    ref={inputRef}
                />
            </div>
            <ul className="command-list"> 
                {filteredCommands.map((command, index) => (
                    <li
                        key={command.title + command.description}
                        className={`command-item ${index === highlightedIndex ? 'highlighted' : ''
                            }`}
                        onClick={() => handleCommandSelect(command)}
                    >
                        <div className="command-title">{command.title}</div>
                        <div className="command-description">
                            {command.description}
                        </div>
                    </li>
                )).slice(0, MAX_COMMANDS)}
                {filteredCommands.length === 0 && (
                    <li className="command-item no-results">No matching commands</li>
                )}
            </ul>
        </div>
    );
};

export default CommandPalette;

