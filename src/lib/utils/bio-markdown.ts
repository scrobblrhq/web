import type { Element, ElementContent, Root, RootContent } from "hast";

type Content = ElementContent | RootContent;

const isImg = (node: Content): node is Element =>
    node.type === "element" && node.tagName === "img";

const isIgnorable = (node: Content): boolean =>
    (node.type === "element" && node.tagName === "br") ||
    (node.type === "text" && node.value.trim() === "");

const isCarousel = (node: Content): node is Element =>
    node.type === "element" &&
    node.properties?.["data-bio-carousel"] === "true";

const groupChildren = (children: Content[]): Content[] => {
    const result: Content[] = [];
    let run: Element[] = [];
    let pending: Content[] = [];

    const flush = () => {
        if (run.length >= 2) {
            const items = run.map((img) => ({
                image: String(img.properties?.src ?? ""),
                alt: String(img.properties?.alt ?? ""),
            }));
            result.push({
                type: "element",
                tagName: "div",
                properties: {
                    "data-bio-carousel": "true",
                    "data-bio-items": JSON.stringify(items),
                },
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

const splitParagraph = (p: Element): Content[] => {
    const out: Content[] = [];
    let buf: ElementContent[] = [];

    const flushBuf = () => {
        if (buf.some((n) => !isIgnorable(n))) {
            out.push({ ...p, children: buf });
        }
        buf = [];
    };

    for (const child of p.children) {
        if (isCarousel(child)) {
            flushBuf();
            out.push(child);
        } else {
            buf.push(child);
        }
    }
    flushBuf();

    return out;
};

const walk = (node: Element | Root) => {
    if (!Array.isArray(node.children) || node.children.length === 0) return;
    for (const child of node.children) {
        if (child.type === "element") walk(child);
    }
    node.children = groupChildren(node.children).flatMap((child) =>
        child.type === "element" &&
        child.tagName === "p" &&
        child.children.some(isCarousel)
            ? splitParagraph(child)
            : [child],
    ) as Element["children"] & Root["children"];
};

export const rehypeGroupBioImages = () => (tree: Root) => {
    walk(tree);
};