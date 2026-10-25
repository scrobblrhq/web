export type SocialPreview = {
  title: string;
  description: string;
  url: string;
  image?: string | null;
};

/** Serializes an inline script payload without allowing user text to close the tag. */
export function serializeJsonForHtml(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

/** Discord's link preview format is a single Container component. */
export function discordComponentEmbed({
  title,
  description,
  url,
  image,
}: SocialPreview) {
  const components: Record<string, unknown>[] = [
    {
      type: 9,
      components: [
        { type: 10, content: `# [${title}](${url})` },
        { type: 10, content: description },
      ],
      accessory: { type: 2, style: 5, url, label: "Open on Scrobblr" },
    },
  ];

  if (image && /^https?:\/\//i.test(image)) {
    components.push({
      type: 12,
      items: [{ media: { url: image }, description: title }],
    });
  }

  return { component: { type: 17, accent_color: 13103979, components } };
}
