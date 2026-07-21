"use client";

import { DndContext, DragEndEvent, useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FormEvent, useState } from "react";

type Column = {
  id: string;
  title: string;
};

type Card = {
  id: string;
  columnId: string;
  title: string;
  details: string;
};

const initialColumns: Column[] = [
  { id: "ideas", title: "Ideas" },
  { id: "pendiente", title: "Pendiente" },
  { id: "progreso", title: "En progreso" },
  { id: "revision", title: "Revisión" },
  { id: "terminado", title: "Terminado" },
];

const initialCards: Card[] = [
  {
    id: "card-1",
    columnId: "ideas",
    title: "Definir experiencia visual",
    details: "Alinear colores, ritmo visual y jerarquía para una primera impresión profesional.",
  },
  {
    id: "card-2",
    columnId: "pendiente",
    title: "Preparar contenido inicial",
    details: "Cargar tarjetas de ejemplo claras para mostrar el flujo del tablero.",
  },
  {
    id: "card-6",
    columnId: "pendiente",
    title: "Validar acciones simples",
    details: "Comprobar que agregar, eliminar y renombrar columnas sea directo.",
  },
  {
    id: "card-3",
    columnId: "progreso",
    title: "Implementar arrastrar y soltar",
    details: "Permitir mover tarjetas entre columnas de forma fluida.",
  },
  {
    id: "card-4",
    columnId: "revision",
    title: "Revisar responsive",
    details: "Comprobar que el tablero sea cómodo en escritorio y móvil.",
  },
  {
    id: "card-5",
    columnId: "terminado",
    title: "Crear proyecto NextJS",
    details: "Scaffolding listo con TypeScript, Tailwind y ESLint.",
  },
];

function KanbanCard({ card, onDelete }: { card: Card; onDelete: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging, isOver } = useSortable({
    id: card.id,
    data: { type: "card" },
  });

  return (
    <article
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`rounded-3xl border bg-white p-4 shadow-[0_18px_45px_rgba(3,33,71,0.10)] transition ${
        isOver ? "border-[#ecad0a] ring-4 ring-[#ecad0a]/20" : "border-slate-200"
      } ${
        isDragging
          ? "z-50 rotate-1 opacity-80"
          : "hover:-translate-y-0.5 hover:shadow-[0_22px_55px_rgba(3,33,71,0.14)]"
      }`}
    >
      <button
        type="button"
        className="w-full cursor-grab text-left active:cursor-grabbing"
        {...listeners}
        {...attributes}
      >
        <h3 className="text-base font-bold text-[#032147]">{card.title}</h3>
        <p className="mt-2 text-sm leading-6 text-[#888888]">{card.details}</p>
      </button>
      <button
        type="button"
        onClick={() => onDelete(card.id)}
        className="mt-4 text-sm font-semibold text-[#753991] transition hover:text-[#032147]"
      >
        Eliminar
      </button>
    </article>
  );
}

function KanbanColumn({
  column,
  cards,
  onRename,
  onAddCard,
  onDeleteCard,
}: {
  column: Column;
  cards: Card[];
  onRename: (columnId: string, title: string) => void;
  onAddCard: (columnId: string, title: string, details: string) => void;
  onDeleteCard: (cardId: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { type: "column" },
  });
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim() || !details.trim()) {
      return;
    }

    onAddCard(column.id, title.trim(), details.trim());
    setTitle("");
    setDetails("");
  }

  return (
    <section
      ref={setNodeRef}
      className={`flex min-h-[32rem] w-full min-w-[18rem] flex-col rounded-[2rem] border p-4 transition ${
        isOver ? "border-[#209dd7] bg-[#209dd7]/10" : "border-white/70 bg-white/75"
      } shadow-[0_24px_70px_rgba(3,33,71,0.12)] backdrop-blur`}
    >
      <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
        <span className="h-3 w-3 rounded-full bg-[#ecad0a]" />
        <input
          aria-label={`Nombre de la columna ${column.title}`}
          value={column.title}
          onChange={(event) => onRename(column.id, event.target.value)}
          className="min-w-0 flex-1 bg-transparent text-lg font-black text-[#032147] outline-none"
        />
        <span className="rounded-full bg-[#032147] px-3 py-1 text-xs font-bold text-white">{cards.length}</span>
      </div>

      <div className="mt-4 flex flex-1 flex-col gap-4">
        <SortableContext items={cards.map((card) => card.id)} strategy={verticalListSortingStrategy}>
          {cards.map((card) => (
            <KanbanCard key={card.id} card={card} onDelete={onDeleteCard} />
          ))}
        </SortableContext>
        {cards.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#209dd7]/40 p-5 text-sm text-[#888888]">
            Arrastra una tarjeta aquí.
          </div>
        ) : null}
      </div>

      <form onSubmit={handleSubmit} className="mt-5 rounded-3xl bg-[#032147] p-4">
        <p className="text-sm font-bold text-white">Nueva tarjeta</p>
        <input
          aria-label="Título de la tarjeta"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Título"
          className="mt-3 w-full rounded-2xl border border-white/20 bg-white/95 px-4 py-3 text-sm text-[#032147] outline-none focus:border-[#ecad0a]"
        />
        <textarea
          aria-label="Detalles de la tarjeta"
          value={details}
          onChange={(event) => setDetails(event.target.value)}
          placeholder="Detalles"
          rows={3}
          className="mt-3 w-full resize-none rounded-2xl border border-white/20 bg-white/95 px-4 py-3 text-sm text-[#032147] outline-none focus:border-[#ecad0a]"
        />
        <button
          type="submit"
          className="mt-3 w-full rounded-2xl bg-[#753991] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#642e7c]"
        >
          Agregar
        </button>
      </form>
    </section>
  );
}

export default function Home() {
  const [columns, setColumns] = useState(initialColumns);
  const [cards, setCards] = useState(initialCards);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over) {
      return;
    }

    if (active.id === over.id) {
      return;
    }

    setCards((currentCards) => {
      const activeCard = currentCards.find((card) => card.id === active.id);

      if (!activeCard) {
        return currentCards;
      }

      const overCard = currentCards.find((card) => card.id === over.id);
      const cardsWithoutActive = currentCards.filter((card) => card.id !== active.id);

      if (overCard) {
        const activeIndex = currentCards.findIndex((card) => card.id === activeCard.id);
        const overIndex = currentCards.findIndex((card) => card.id === overCard.id);
        const cardsWithTargetColumn = currentCards.map((card) =>
          card.id === activeCard.id ? { ...card, columnId: overCard.columnId } : card,
        );

        return arrayMove(cardsWithTargetColumn, activeIndex, overIndex);
      }

      const targetColumn = columns.find((column) => column.id === over.id);

      if (!targetColumn) {
        return currentCards;
      }

      return [...cardsWithoutActive, { ...activeCard, columnId: targetColumn.id }];
    });
  }

  function renameColumn(columnId: string, title: string) {
    setColumns((currentColumns) =>
      currentColumns.map((column) => (column.id === columnId ? { ...column, title } : column)),
    );
  }

  function addCard(columnId: string, title: string, details: string) {
    setCards((currentCards) => [
      ...currentCards,
      { id: crypto.randomUUID(), columnId, title, details },
    ]);
  }

  function deleteCard(cardId: string) {
    setCards((currentCards) => currentCards.filter((card) => card.id !== cardId));
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#f5f7fb] text-[#032147]">
      <div className="absolute inset-0 -z-0 bg-[radial-gradient(circle_at_top_left,rgba(32,157,215,0.22),transparent_34%),radial-gradient(circle_at_top_right,rgba(236,173,10,0.24),transparent_28%),linear-gradient(135deg,#ffffff,#eef3fb)]" />
      <div className="relative z-10 px-5 py-8 sm:px-8 lg:px-10">
        <header className="mx-auto flex max-w-[96rem] flex-col gap-6 rounded-[2.5rem] border border-white/80 bg-white/70 p-6 shadow-[0_24px_80px_rgba(3,33,71,0.12)] backdrop-blur lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.28em] text-[#209dd7]">Gestor Kanban</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-black tracking-tight text-[#032147] sm:text-6xl">
              Un tablero claro para avanzar sin ruido.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#888888] sm:text-lg">
              Mueve tarjetas entre columnas, ordénalas por prioridad y agrega trabajo nuevo en segundos.
            </p>
          </div>
          <div className="rounded-3xl bg-[#032147] px-6 py-5 text-white">
            <p className="text-sm text-white/70">Tarjetas activas</p>
            <p className="mt-1 text-4xl font-black">{cards.length}</p>
          </div>
        </header>

        <DndContext onDragEnd={handleDragEnd}>
          <div className="mx-auto mt-8 flex max-w-[96rem] gap-5 overflow-x-auto pb-8">
            {columns.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                cards={cards.filter((card) => card.columnId === column.id)}
                onRename={renameColumn}
                onAddCard={addCard}
                onDeleteCard={deleteCard}
              />
            ))}
          </div>
        </DndContext>
      </div>
    </main>
  );
}
