// hooks/useExpenses.ts
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@lib/supabaseClient";
import { Expense } from "@/types/database";
import { message } from "antd";

interface UseExpensesOptions {
  employeeId?: string;
  taxStatus?: string;
  dateFrom?: string;
  dateTo?: string;
}

export function useExpenses(options: UseExpensesOptions = {}) {
  const [data, setData] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchExpenses = async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from("expenses")
        .select("*")
        .order("date", { ascending: false });

      // Apply filters if provided
      if (options.employeeId) {
        query = query.eq("employee_id", options.employeeId);
      }

      if (options.taxStatus) {
        query = query.eq("tax_status", options.taxStatus);
      }

      if (options.dateFrom) {
        query = query.gte("date", options.dateFrom);
      }

      if (options.dateTo) {
        query = query.lte("date", options.dateTo);
      }

      const { data: expenses, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      setData(expenses || []);
    } catch (err) {
      const error = err as Error;
      setError(error);
      message.error(`Failed to load expenses: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [
    options.employeeId,
    options.taxStatus,
    options.dateFrom,
    options.dateTo,
  ]);

  return {
    data,
    loading,
    error,
    refetch: fetchExpenses,
  };
}
