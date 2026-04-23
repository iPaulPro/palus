export type PlateNode = PlateBlockNode | PlateInlineNode;

interface PlateBlockNode {
  type: string;
  children: PlateNode[];
  url?: string;
  [key: string]: unknown;
}

interface PlateInlineNode {
  text: string;
  bold?: boolean;
  italic?: boolean;
  code?: boolean;
  [key: string]: unknown;
}

const isTextNode = (node: PlateNode): node is PlateInlineNode => "text" in node;

const convertInline = (node: PlateNode): string => {
  if (isTextNode(node)) {
    let text = node.text;
    if (!text) return "";
    const trimmed = text.trim();
    const leading = text.slice(0, text.length - text.trimStart().length);
    const trailing = text.slice(trimmed.length + leading.length);
    text = trimmed;
    if (node.code) text = `\`${text}\``;
    if (node.bold && node.italic) text = `***${text}***`;
    else if (node.bold) text = `**${text}**`;
    else if (node.italic) text = `*${text}*`;
    return leading + text + trailing;
  }

  const block = node as PlateBlockNode;

  if (block.type === "a") {
    const label = block.children.map(convertInline).join("");
    return `[${label}](${block.url ?? ""})`;
  }

  return block.children.map(convertInline).join("");
};

const convertChildren = (children: PlateNode[]): string =>
  children.map(convertInline).join("");

const convertNode = (node: PlateNode, listIndex?: number): string => {
  if (isTextNode(node)) return convertInline(node);

  const block = node as PlateBlockNode;
  const inner = convertChildren(block.children);

  switch (block.type) {
    case "title":
      return `# ${inner}`;
    case "subtitle":
      return `## ${inner}`;
    case "h1":
      return `# ${inner}`;
    case "h2":
      return `## ${inner}`;
    case "h3":
      return `### ${inner}`;
    case "h4":
      return `#### ${inner}`;
    case "h5":
      return `##### ${inner}`;
    case "h6":
      return `###### ${inner}`;
    case "p":
      return inner;
    case "blockquote":
      return `> ${inner}`;
    case "code_block":
      return `\`\`\`\n${inner}\n\`\`\``;
    case "img": {
      const alt = inner.trim();
      return `![${alt}](${block.url ?? ""})`;
    }
    case "a":
      return convertInline(node);
    case "ol":
      return block.children
        .map((child, i) => convertNode(child, i + 1))
        .join("\n");
    case "ul":
      return block.children.map((child) => convertNode(child)).join("\n");
    case "li": {
      const lic = block.children.find(
        (c) => !isTextNode(c) && (c as PlateBlockNode).type === "lic"
      ) as PlateBlockNode | undefined;
      const text = lic
        ? convertChildren(lic.children)
        : convertChildren(block.children);
      const prefix = listIndex == null ? "-" : `${listIndex}.`;
      return `${prefix} ${text}`;
    }
    case "lic":
      return inner;
    default:
      return inner;
  }
};

export const plateToMd = (nodes: PlateNode[]): string =>
  nodes
    .map((node) => convertNode(node))
    .filter(Boolean)
    .join("\n\n");
