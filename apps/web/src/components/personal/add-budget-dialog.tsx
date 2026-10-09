"use client";

import { useEffect, useState, type ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Plus } from "@phosphor-icons/react";
import { budgetPeriodNoun, type BudgetPeriod, type PersonalBudget } from "@evensplit/shared";
import { createPersonalBudgetSchema, type CreatePersonalBudgetInput } from "@evensplit/shared";
import { Button } from "@/components/ui/button";
import { AmountInput } from "@/components/ui/amount-input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePersonalCategories, useUpsertPersonalBudget } from "@/hooks/use-personal";

const PERIODS: { value: BudgetPeriod; label: string }[] = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
];

export function AddBudgetDialog({ budget, trigger }: { budget?: PersonalBudget; trigger?: ReactNode } = {}) {
  const editing = !!budget;
  const [open, setOpen] = useState(false);
  const { data: categories } = usePersonalCategories();
  const upsertBudget = useUpsertPersonalBudget();
  const expenseCategories = categories?.filter((c) => c.kind === "expense") ?? [];

  const { handleSubmit, reset, watch, setValue, formState } = useForm<CreatePersonalBudgetInput>({
    resolver: zodResolver(createPersonalBudgetSchema),
    defaultValues: { category_id: "", monthly_limit: 0, period: "monthly" },
  });
  const period = watch("period") ?? "monthly";

  useEffect(() => {
    if (!open) return;
    if (budget) {
      reset({ category_id: budget.category_id, monthly_limit: budget.monthly_limit, period: budget.period ?? "monthly" });
    } else {
      reset({ category_id: "", monthly_limit: 0, period: "monthly" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, budget]);

  async function onSubmit(values: CreatePersonalBudgetInput) {
    try {
      await upsertBudget.mutateAsync(values);
      toast.success("Budget saved");
      setOpen(false);
      reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save budget");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button className="rounded-lg" disabled={expenseCategories.length === 0} data-create-action={expenseCategories.length === 0 ? undefined : true}>
            <Plus className="mr-1 h-4 w-4" /> Set budget
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit budget" : "Set a budget"}</DialogTitle>
          <DialogDescription>A spending limit for one category, per month, quarter or year.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select
              value={watch("category_id")}
              disabled={editing}
              onValueChange={(v) => setValue("category_id", v, { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {expenseCategories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Repeats</Label>
            <div className="grid grid-cols-3 gap-2">
              {PERIODS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setValue("period", p.value, { shouldValidate: true })}
                  className={`rounded-full border py-2 text-sm font-semibold transition-colors ${
                    period === p.value ? "border-primary bg-primary-light text-primary-deep" : "border-border text-muted-foreground"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="monthly-limit">{`Limit per ${budgetPeriodNoun(period)}`}</Label>
            <AmountInput
              id="monthly-limit"
              value={watch("monthly_limit")}
              onChange={(v) => setValue("monthly_limit", v, { shouldValidate: true })}
              ariaInvalid={!!formState.errors.monthly_limit}
            />
            {formState.errors.monthly_limit && (
              <p className="text-xs text-destructive">{formState.errors.monthly_limit.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="submit" className="w-full" disabled={upsertBudget.isPending}>
              {editing ? "Save changes" : "Save budget"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
