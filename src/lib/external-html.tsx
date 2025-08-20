import parse, { Element } from "html-react-parser";
import { urlJoin } from "url-join-ts";
import { env } from "~/env";

function convertRelativeUrl(url: string) {
  // url starts with '/' (base-relative url), not '//' (auto-protocol absolute url)
  if (url.search(/^\/[^/]/) > -1) {
    return urlJoin(env.NEXT_PUBLIC_CF_HOST, url.slice(1));
  }
  return url;
}

export function parseExternalHtml(html: string) {
  return parse(html, {
    replace: (domNode) => {
      // noinspection SuspiciousTypeOfGuard idk why webstorm doesn't recognize this as valid
      if (domNode instanceof Element) {
        let element = null;
        switch (domNode.tagName) {
          case "script":
            console.error("Illegal script tag in item description!", domNode);
            break;
          case "style":
            console.warn("Illegal style tag in item description!", domNode);
            break;
          case "img":
            // make sure relative images reference our domain
            if (domNode.attribs["src"] !== undefined)
              domNode.attribs["src"] = convertRelativeUrl(
                domNode.attribs["src"],
              );
            element = domNode;
            break;
          case "a":
            domNode.attribs["href"] = "#";
            element = domNode;
            break;
          default:
            break;
        }
        return element;
      }
    },
  });
}
