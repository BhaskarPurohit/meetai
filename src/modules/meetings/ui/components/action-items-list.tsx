"use client";

import { useOptimistic, useTransition } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { toggleActionItem } from "@/modules/meetings/server/actions";
import type { ActionItem } from "@/lib/db/schema";

function formatDueDate(d: Date | string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(d));
}

export function ActionItemsList({ items }: { items: ActionItem[] }) {
  const [optimisticItems, applyOptimistic] = useOptimistic(
    items,
    (state, { id, completed }: { id: string; completed: boolean }) =>
      state.map((item) => (item.id === id ? { ...item, completed } : item))
  );

  const [, startTransition] = useTransition();

  function handleToggle(item: ActionItem) {
    const next = !item.completed;
    startTransition(async () => {
      applyOptimistic({ id: item.id, completed: next });
      await toggleActionItem(item.id, next);
    });
  }

  return (
    <div className="intel-action-items">
      {optimisticItems.map((item) => (
        <div key={item.id} className="intel-action-item">
          <Checkbox
            checked={item.completed ?? false}
            onCheckedChange={() => handleToggle(item)}
            aria-label={`Mark "${item.task}" as ${item.completed ? "incomplete" : "complete"}`}
            className="intel-action-checkbox"
          />
          <div className="intel-action-body">
            <span
              className="intel-action-task"
              data-completed={item.completed ? "true" : undefined}
            >
              {item.task}
            </span>
            <div className="intel-action-meta">
              {item.owner && (
                <span className="intel-action-owner">{item.owner}</span>
              )}
              {item.dueDate && (
                <span
                  className="intel-action-due"
                  data-overdue={
                    !item.completed && new Date(item.dueDate) < new Date()
                      ? "true"
                      : undefined
                  }
                >
                  Due {formatDueDate(item.dueDate)}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
