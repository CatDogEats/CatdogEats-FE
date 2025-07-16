export type NavigationItem =
    | {
    label: string;
    path: string;
    subItems?: NavigationItem[];
    action?: () => void;
}
    | {
    label: string;
    subItems: NavigationItem[];
    action?: () => void;
}
    | {
    label: string;
    action: () => void;
};
