import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { isValidElement } from "react";
import { slugify } from "@/lib/blog";

function textOf(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) return textOf(node.props.children);
  return "";
}

/* ─────────── Custom blocks you can use inside .mdx posts ─────────── */

/** The central question of the session — big, boxed, red accent. */
export function Pregunta({ children }: { children: ReactNode }) {
  return (
    <aside className="my-8 rounded-2xl bg-gray-900 text-white px-6 py-6 sm:px-7 sm:py-7">
      <p className="text-xs font-bold uppercase tracking-widest text-red-400 mb-3">
        La pregunta de la sesión
      </p>
      <div className="text-lg sm:text-xl font-semibold leading-snug [&_p]:m-0 [&_p]:text-inherit [&_p]:text-lg sm:[&_p]:text-xl [&_p]:leading-snug">
        {children}
      </div>
    </aside>
  );
}

/** Grid wrapper for <Perspectiva> cards. */
export function Perspectivas({ children }: { children: ReactNode }) {
  return <div className="my-8 grid gap-4 md:grid-cols-3">{children}</div>;
}

/** One person's point of view in the conversation. */
export function Perspectiva({
  nombre,
  rol,
  children,
}: {
  nombre: string;
  rol?: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-5 flex flex-col">
      <div className="flex items-center gap-3 mb-3">
        <span className="w-9 h-9 shrink-0 rounded-full bg-red-600 text-white font-bold flex items-center justify-center">
          {nombre.charAt(0)}
        </span>
        <div>
          <p className="font-semibold text-gray-900 leading-tight">{nombre}</p>
          {rol && <p className="text-xs text-red-600 font-medium">{rol}</p>}
        </div>
      </div>
      <div className="text-sm text-gray-600 leading-relaxed [&_p]:text-sm [&_p]:leading-relaxed [&_p]:mb-3 [&_p:last-child]:mb-0">
        {children}
      </div>
    </div>
  );
}

/** The episode's signature phrase — large centered pull quote. */
export function Frase({ children, autor }: { children: ReactNode; autor?: string }) {
  return (
    <figure className="my-10 text-center px-2">
      <span className="block text-7xl leading-[0.6] h-8 text-red-600 font-serif" aria-hidden>
        “
      </span>
      <blockquote className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 leading-tight [&_p]:m-0 [&_p]:text-inherit [&_p]:text-2xl sm:[&_p]:text-3xl [&_p]:font-bold [&_p]:leading-tight [&_p]:text-gray-900">
        {children}
      </blockquote>
      {autor && (
        <figcaption className="mt-4 text-sm font-medium text-gray-400">— {autor}</figcaption>
      )}
    </figure>
  );
}

/** "Para llevar" — key takeaways box. */
export function Claves({ titulo = "Para llevar", children }: { titulo?: string; children: ReactNode }) {
  return (
    <aside className="my-10 rounded-2xl border-2 border-red-100 bg-red-50/40 p-5 sm:p-7">
      <p className="text-xs font-bold uppercase tracking-widest text-red-600 mb-4">{titulo}</p>
      <div className="[&_ul]:mb-0 [&_li]:text-[15px]">{children}</div>
    </aside>
  );
}

/* ─────────── Default markdown element styles ─────────── */

export const mdxComponents = {
  Pregunta,
  Perspectivas,
  Perspectiva,
  Frase,
  Claves,
  h2: ({ children, ...p }: ComponentPropsWithoutRef<"h2">) => (
    <h2
      id={slugify(textOf(children))}
      className="scroll-mt-24 text-xl sm:text-2xl font-bold tracking-tight text-gray-900 mt-12 mb-4"
      {...p}
    >
      {children}
    </h2>
  ),
  h3: (p: ComponentPropsWithoutRef<"h3">) => (
    <h3 className="text-lg font-semibold text-gray-900 mt-8 mb-2" {...p} />
  ),
  p: (p: ComponentPropsWithoutRef<"p">) => (
    <p className="text-base text-gray-600 leading-7 mb-5" {...p} />
  ),
  ul: (p: ComponentPropsWithoutRef<"ul">) => <ul className="space-y-1.5 mb-5" {...p} />,
  ol: (p: ComponentPropsWithoutRef<"ol">) => (
    <ol
      className="list-decimal pl-6 space-y-1.5 mb-5 text-base text-gray-600 marker:text-red-500 marker:font-semibold"
      {...p}
    />
  ),
  li: (p: ComponentPropsWithoutRef<"li">) => (
    <li
      className="text-base text-gray-600 leading-7 pl-1 [ul>&]:flex [ul>&]:gap-3 [ul>&]:before:content-['●'] [ul>&]:before:text-red-500 [ul>&]:before:text-xs [ul>&]:before:mt-1"
      {...p}
    />
  ),
  blockquote: (p: ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote
      className="border-l-4 border-red-500 pl-5 py-1 my-8 [&_p]:text-lg [&_p]:italic [&_p]:text-gray-800 [&_p]:mb-0"
      {...p}
    />
  ),
  a: (p: ComponentPropsWithoutRef<"a">) => (
    <a className="text-red-600 underline underline-offset-2 hover:text-red-700" {...p} />
  ),
  strong: (p: ComponentPropsWithoutRef<"strong">) => (
    <strong className="font-semibold text-gray-900" {...p} />
  ),
  em: (p: ComponentPropsWithoutRef<"em">) => <em className="text-gray-800" {...p} />,
  hr: () => (
    <div className="my-10 flex justify-center gap-3 text-red-500" aria-hidden>
      <span>●</span>
      <span>●</span>
      <span>●</span>
    </div>
  ),
  img: (p: ComponentPropsWithoutRef<"img">) => (
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    <img className="rounded-xl my-8 w-full" {...p} />
  ),
};
