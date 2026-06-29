export function formatDateToDMMMYYYY(dateStr) {
  if (!dateStr) return "TBD";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const day = date.getDate();
  const month = date.toLocaleDateString("en-US", { month: "short" });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

export function normalizeScholarshipPlanResponse(data) {
  if (!data) {
    return {
      study_plan: [],
      schedule: [],
      total_price: null,
      calculation_breakdown: null,
      installments_count: null,
    };
  }

  const paymentPlan = data.payment_plan || {};

  return {
    study_plan: data.study_plan || [],
    schedule: paymentPlan.schedule || [],
    total_price: paymentPlan.total_price ?? null,
    calculation_breakdown: paymentPlan.calculation_breakdown || null,
    installments_count: paymentPlan.installments_count ?? null,
  };
}

export function canGenerateSchedule(activePriceSettings) {
  if (!activePriceSettings?.length) return false;
  const paymentMethods = activePriceSettings.filter((ps) => ps.type === "Payment Method");
  return paymentMethods.length === 1;
}

export function pickDefaultPaymentMethod(paymentOptions, current) {
  if (!paymentOptions?.length) return current || "";
  if (current && paymentOptions.includes(current)) return current;
  return paymentOptions[0];
}

export function mapStudyPlanToModules(studyPlan, baseScholarshipPrice) {
  if (!studyPlan || studyPlan.length === 0) {
    return [];
  }

  const avgAmount = Math.round((baseScholarshipPrice || 0) / studyPlan.length);

  return studyPlan.map((item) => {
    const startsAt = item.starts_at;
    const dateObj = startsAt ? new Date(startsAt) : null;

    let formattedDate = "";
    let dayName = "";
    let deadlineStr = "";

    if (dateObj && !isNaN(dateObj.getTime())) {
      const dd = String(dateObj.getDate()).padStart(2, "0");
      const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
      const yyyy = dateObj.getFullYear();
      formattedDate = `${dd}/${mm}/${yyyy}`;
      dayName = dateObj.toLocaleDateString("en-US", { weekday: "short" });

      const deadlineDate = new Date(dateObj);
      deadlineDate.setDate(deadlineDate.getDate() - 1);
      deadlineStr = `${deadlineDate.getDate()} ${deadlineDate.toLocaleDateString("en-US", { month: "short" })} ${deadlineDate.getFullYear()}`;
    } else {
      formattedDate = startsAt || "N/A";
      dayName = "TBD";
      deadlineStr = "TBD";
    }

    return {
      name: item.course_name,
      code: String(item.course_code),
      startDate: formattedDate,
      day: dayName,
      time: "10 to 3",
      amount: avgAmount,
      deadline: deadlineStr,
    };
  });
}

export function mergeInstallmentsIntoModules(modules, schedule) {
  if (!schedule || schedule.length === 0) {
    return modules || [];
  }

  if (!modules || modules.length === 0) {
    return schedule.map((item) => {
      const dateObj = new Date(item.due_date);
      const formattedDeadline = formatDateToDMMMYYYY(item.due_date);
      const dayName = !isNaN(dateObj.getTime())
        ? dateObj.toLocaleDateString("en-US", { weekday: "short" })
        : "TBD";

      return {
        name: `Installment #${item.installment_number}`,
        code: "PAY",
        startDate: formattedDeadline,
        day: dayName,
        time: "-",
        amount: item.amount,
        deadline: formattedDeadline,
      };
    });
  }

  return modules.map((mod, index) => {
    if (index < schedule.length) {
      const item = schedule[index];
      return {
        ...mod,
        amount: item.amount,
        deadline: formatDateToDMMMYYYY(item.due_date),
      };
    }
    return { ...mod, amount: null, deadline: "-" };
  });
}

export function flattenPriceSettings(data) {
  const flattened = [];
  const addSetting = (ps) => {
    if (!ps?.id || flattened.some((x) => x.id === ps.id)) return;
    flattened.push(ps);
  };

  if (!Array.isArray(data)) return flattened;

  data.forEach((ps) => {
    addSetting(ps);
    if (ps.parents && Array.isArray(ps.parents)) {
      ps.parents.forEach((parent) => addSetting(parent));
    }
    if (ps.children && Array.isArray(ps.children)) {
      ps.children.forEach((child) => {
        child.parent_ids = [ps.id];
        addSetting(child);
        if (child.parents && Array.isArray(child.parents)) {
          child.parents.forEach((parent) => addSetting(parent));
        }
      });
    }
  });

  return flattened;
}
