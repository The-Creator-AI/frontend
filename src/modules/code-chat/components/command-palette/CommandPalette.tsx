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

const MAX_COMMANDS = 50;

const CommandPalette = <T,>({ placeholder, commands, onSelect, isOpen, position = 'center' }: CommandPaletteProps<T>) => {
    const [filteredCommands, setFilteredCommands] = useState(commands);
    const [searchTerm, setSearchTerm] = useState('');
    const commandListRef = useRef<HTMLUListElement | null>(null); 
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // let's use ref to add highlighted class to the first item
        if (isOpen && commandListRef.current && inputRef.current) {
            commandListRef.current.scrollTop = 0;
            commandListRef.current.querySelector('#command-0')?.classList.add('highlighted');
        }
    }, []);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (isOpen) {
                switch (event.key) {
                    case 'ArrowUp':
                        event.preventDefault();
                        const prevIndex = commandListRef.current?.querySelector('.highlighted')?.id.split('-')[1];
                        if (prevIndex) {
                            const newIndex = Math.max(0, parseInt(prevIndex) - 1);
                            if (newIndex === parseInt(prevIndex)) break;
                            commandListRef.current?.querySelector(`#command-${prevIndex}`)?.classList.remove('highlighted');
                            const newElement = commandListRef.current?.querySelector(`#command-${newIndex}`);
                            newElement?.classList.add('highlighted');
                            newElement?.scrollIntoView({ block: 'nearest' });
                        }
                        break;
                    case 'ArrowDown':
                        event.preventDefault();
                        const prevIdx = commandListRef.current?.querySelector('.highlighted')?.id.split('-')[1];
                        if (prevIdx) {
                            const newIndex = Math.min(filteredCommands.length - 1, MAX_COMMANDS - 1, parseInt(prevIdx) + 1);
                            if (newIndex === parseInt(prevIdx)) break;
                            commandListRef.current?.querySelector(`#command-${prevIdx}`)?.classList.remove('highlighted');
                            const newElement = commandListRef.current?.querySelector(`#command-${newIndex}`);
                            newElement?.classList.add('highlighted');
                            newElement?.scrollIntoView({ block: 'nearest' });
                        }
                        break;
                    case 'Enter':
                        event.preventDefault();
                        const highlightedElement = commandListRef.current?.querySelector('.highlighted');
                        if (highlightedElement) {
                            const commandId = highlightedElement.id;
                            const commandIndex = parseInt(commandId.split('-')[1]);
                            onSelect(filteredCommands[commandIndex]);
                            setSearchTerm('');
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
    }, [filteredCommands, isOpen, onSelect]);


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
        commandListRef.current?.querySelector('.highlighted')?.classList.remove('highlighted');
        commandListRef.current?.querySelector('#command-0')?.classList.add('highlighted');
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
            <ul className="command-list" ref={commandListRef}>
                {filteredCommands.map((command, index) => (
                    <li
                        id={`command-${index}`}
                        key={command.title + command.description}
                        className='command-item'
                        onClick={() => handleCommandSelect(command)}
                    >
                        <div className="command-title">
                            {command.title.split(new RegExp(`(${searchTerm})`, 'gi')).map((part, i) => (
                                <span key={i} className={part.toLowerCase() === searchTerm.toLowerCase() ? 'match' : ''}>
                                    {part}
                                </span>
                            ))}
                        </div>
                        <div className="command-description">
                            {command.description.split(new RegExp(`(${searchTerm})`, 'gi')).map((part, i) => (
                                <span key={i} className={part.toLowerCase() === searchTerm.toLowerCase() ? 'match' : ''}>
                                    {part}
                                </span>
                            ))}
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

