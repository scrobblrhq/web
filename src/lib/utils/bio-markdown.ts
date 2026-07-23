import type { Element, ElementContent, Root, RootContent } from "hast";

type Content = ElementContent | RootContent;

const isImg = (node: Content): node is Element =>
    node.type === "element" && node.tagName === "img";

const isIgnorable = (node: Content): boolean =>
    (node.type === "element" && node.tagName === "br") ||
    (node.type === "text" && node.value.trim() === "");

const groupChildren = (children: Content[]): Content[] => {
    const result: Content[] = [];
    let run: Element[] = [];
    let pending: Content[] = [];

    const flush = () => {
        if (run.length >= 2) {
            result.push({
                type: "element",
                tagName: "div",
                properties: { "data-bio-carousel": "true" },
                children: run,
            });
        } else {
            result.push(...run, ...pending);
        }
        run = [];
        pending = [];
    };

    for (const node of children) {
        if (isImg(node)) {
            run.push(node);
            pending = [];
        } else if (isIgnorable(node) && run.length > 0) {
            pending.push(node);
        } else {
            flush();
            result.push(node);
        }
    }
    flush();

    return result;
};

const walk = (node: Element | Root) => {
    if (!Array.isArray(node.children) || node.children.length === 0) return;
    for (const child of node.children) {
        if (child.type === "element") walk(child);
    }
    node.children = groupChildren(node.children) as Element["children"] &
        Root["children"];
};

export const rehypeGroupBioImages = () => (tree: Root) => {
    walk(tree);
};
