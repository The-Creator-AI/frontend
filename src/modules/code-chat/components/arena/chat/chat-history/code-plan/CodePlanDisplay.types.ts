export interface CodeStep {
  filename: string;
  recommendations: string[];
}

export interface CommandStep {
  command: string;
  description: string;
}

export interface CodePlanDisplayProps {
  chatId: number;
  messageId: string;
  plan: {
    title: string;
    description: string;
    code_plan: (CodeStep | CommandStep)[];
  };
}
