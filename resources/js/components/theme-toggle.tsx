import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppearance } from '@/hooks/use-appearance';

export function ThemeToggle() {
    const { appearance, updateAppearance } = useAppearance();

    const toggleTheme = () => {
        updateAppearance(appearance === 'dark' ? 'light' : 'dark');
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="group h-9 w-9 cursor-pointer rounded-full"
            aria-label="Toggle theme"
        >
            {appearance === 'dark' ? (
                <Moon className="h-5 w-5 opacity-80 group-hover:opacity-100 transition-all text-neutral-300" />
            ) : (
                <Sun className="h-5 w-5 opacity-80 group-hover:opacity-100 transition-all text-neutral-700" />
            )}
        </Button>
    );
}
