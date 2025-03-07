import { Icons } from "../shared"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
    const { setTheme, theme } = useTheme()

    return (
        <Button
            variant="ghost"
            size="icon"
            className="bg-zinc-100 dark:bg-dark-4 transform transition duration-500 ease-in-out"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        >
            <Icons.sun className="h-[1.5rem] w-[1.3rem] dark:hidden" />
            <Icons.moon className="hidden h-5 w-5 dark:block" />
            <span className="sr-only">Toggle theme</span>
        </Button>
    )
}