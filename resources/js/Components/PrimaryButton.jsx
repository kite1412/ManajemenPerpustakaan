export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center rounded-md border border-transparent bg-brand px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gray-800 transition duration-150 ease-in-out hover:bg-brand-2 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 active:opacity-95 ${
                    disabled && 'opacity-25'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
