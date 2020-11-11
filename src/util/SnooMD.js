/*
To Build a table, requires:
Array of header names (Strings)
An array of row objects with keys related to the headers.
It will automatically set the alignment to the first columns to center, with the final column being left aligned.

EXAMPLE:

const row1 = {
    rating: "5",
    type: "Trade",
    comments: "https://www.reddit.com/r/s/g6j7nix?utm_source=share&utm_medium=web2x&context=3"
}
const row2 = {
    rating: "2",
    type: "Giveaway",
    comments: `https://www.reddit.com/r/s/g6j7nix?utm_source=share&utm_medium=web2x&context=3`
}
const row3 = {
    rating: "1",
    type: "Sale",
    comments: "https://www.reddit.com/r/s/g6j7nix?utm_source=share&utm_medium=web2x&context=3"
}
const t = md.table(["Rating", "Type", "Comments"], [row1,row2,row3])

*/
class Table {
    constructor(headers, rows) {
        this.headers = headers;
        this.rows = rows;
        this.a = {
            left: ":-",
            right: "-:",
            center: ":-:"
        }
    }
    build() {
        // Headers
        let h = "|";
        this.headers.forEach(header => {
            h += `${header}|`;
        });
        // Seperators/Alignment
        let s = "|";
        for (let i = 0; i < this.headers.length - 1; i++) {
            s += `${this.a.center}|`;
        }
        s += `${this.a.left}|`;
        // Rows
        let r = "|";
        this.rows.forEach((row, index) => {
            const values = Object.values(row)
            for (const value of values) {
                r += `${value}|`;
            }
            index < this.rows.length - 1 ? r += `\n|` : r += `\n`;
        })
        return `${h}\n${s}\n${r}`;
    }
}

/*
Reddit Flavoured Markdown:
https://www.reddit.com/wiki/markdown
*/
module.exports = class Markdown {
    constructor() {
        this.italic = "_";
        this.bold = "__";
        this.bold_italic = "___";
        this.strikethrough = "~~";
        this.spoilers = ">!";
        this.codeblock = "\`";
    }
    apply(str, md) {
        return md + str + md.split("").reverse().join("");
    }
    superscript(str) {
        return `^(${str})`;
    }
    link(url,t) {
        let u;
        url.includes('"') ?
            u = url.replace(/\"/g, '\\"') : u = url;
        return !t ?
            `[${url}](${u})` :
            `[${t}](${u})`;
    }
    h1(str) {
        return `#${str}`;
    }
    h2(str) {
        return `##${str}`;
    }
    h3(str) {
        return `###${str}`;
    }
    ul(str) {
        return `- ${str}`;
    }
    ol(str, n) {
        return `  ${n}. ${str}`;
    }
    blockquote(str) {
        return `> ${str}`;
    }
    fence(str) {
        return `\`\`\`\n${str}\n\`\`\``;
    }
    table(headers, rows) {
        return new Table(headers, rows).build();
    }
}
