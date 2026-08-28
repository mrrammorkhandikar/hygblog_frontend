'use client';

import { useState } from 'react';
import { ChevronDown, List } from 'lucide-react';

export type TocHeading = {
  id: string;
  text: string;
  level: number;
};

type NestedHeading = TocHeading & { children: NestedHeading[] };

function nestHeadings(headings: TocHeading[]): NestedHeading[] {
  const roots: NestedHeading[] = [];
  const stack: NestedHeading[] = [];

  for (const heading of headings) {
    const node: NestedHeading = { ...heading, children: [] };
    while (stack.length && stack[stack.length - 1].level >= heading.level) {
      stack.pop();
    }
    if (stack.length === 0) {
      roots.push(node);
    } else {
      stack[stack.length - 1].children.push(node);
    }
    stack.push(node);
  }

  return roots;
}

function HeadingLinks({ items }: { items: NestedHeading[] }) {
  return (
    <ul className="list-disc list-outside pl-5 space-y-2 marker:text-black">
      {items.map((item) => (
        <li key={item.id} className="text-black">
          <a
            href={`#${item.id}`}
            className="text-[#0f766e] hover:text-[#06b6d4] transition-colors leading-snug"
          >
            {item.text}
          </a>
          {item.children.length > 0 && (
            <div className="mt-2">
              <HeadingLinks items={item.children} />
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

export default function TableOfContents({ headings }: { headings: TocHeading[] }) {
  const [open, setOpen] = useState(true);

  if (!headings.length) return null;

  const nested = nestHeadings(headings);

  return (
    <nav
      aria-label="Table of contents"
      className="mb-10 rounded-2xl border border-[#ccfbf1] bg-[#f0fdfa] p-5 md:p-6"
    >
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 text-left cursor-pointer"
      >
        <span className="flex items-center gap-2">
          <List className="w-5 h-5 text-[#0f766e]" />
          <span
            className="text-lg font-semibold text-[#0f766e]"
            style={{ fontFamily: '"Playfair Display", serif' }}
          >
            In this article
          </span>
        </span>
        <ChevronDown
          className={`w-5 h-5 text-[#0f766e] shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="mt-4">
          <HeadingLinks items={nested} />
        </div>
      )}
    </nav>
  );
}
