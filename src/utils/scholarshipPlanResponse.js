export function formatDateToDMMMYYYY(dateStr) {
  if (!dateStr) return "TBD";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const day = date.getDate();
  const month = date.toLocaleDateString("en-US", { month: "short" });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

export function normalizeCalculationResponse(data) {
  if (!data) {
    return normalizeScholarshipPlanResponse(null);
  }
  if (data.payment_plan) {
    return normalizeScholarshipPlanResponse(data);
  }
  return {
    study_plan: data.study_plan || [],
    schedule: data.schedule || [],
    total_price: data.total_price ?? null,
    calculation_breakdown: data.calculation_breakdown || null,
    installments_count: data.installments_count ?? null,
  };
}

export function buildCalculatedBreakdown(apiResult, basePrice, activePriceSettings = []) {
  const base = basePrice ?? 0;

  if (apiResult) {
    const cb = apiResult.calculation_breakdown;
    const apiBase = cb?.base_scholarship_price || base;
    const list = [];

    if (cb?.applied_modifiers) {
      cb.applied_modifiers.forEach((item, index) => {
        const val = parseFloat(item.calculated_value) || 0;
        const absVal = Math.abs(val);
        list.push({
          id: `api-mod-${index}`,
          name: item.name,
          type: item.type,
          description: item.description || "",
          modifier: item.modifier,
          amount_type: item.amount_type,
          amount: parseFloat(item.raw_amount) || 0,
          impact: absVal,
          impactSigned: val,
          displayImpact: (val < 0 ? "-" : "+") + absVal.toLocaleString() + " EGP",
          displayRate:
            item.amount_type === "percentage"
              ? `${parseFloat(item.raw_amount)}%`
              : `${parseFloat(item.raw_amount).toLocaleString()} EGP`,
        });
      });
    }

    const totalAdjustments = list.reduce((sum, item) => sum + item.impactSigned, 0);
    const suggestedFinalAmount = apiResult.total_price ?? apiBase + totalAdjustments;
    const remainingBalance = cb?.remaining_balance_to_be_split;
    const installmentsCount = apiResult.installments_count;
    const subPaymentMethod = cb?.sub_payment_method ?? apiResult?.sub_payment_method;
    const calculatedValue = subPaymentMethod?.calculated_value;

    let firstInstallment = null;
    if (calculatedValue !== null && calculatedValue !== undefined) {
      firstInstallment = parseFloat(calculatedValue);
    }

    const firstDeadline = (calculatedValue !== null && calculatedValue !== undefined && apiResult.schedule?.[0]?.due_date)
      ? formatDateToDMMMYYYY(apiResult.schedule[0].due_date)
      : null;

    return {
      basePrice: apiBase,
      modifiers: list,
      totalAdjustments,
      suggestedFinalAmount,
      remainingBalance,
      installmentsCount,
      firstInstallment,
      firstDeadline,
    };
  }

  if (activePriceSettings?.length) {
    const list = activePriceSettings.map((item) => {
      const amountVal = parseFloat(item.amount) || 0;
      let impact = 0;
      if (item.amount_type === "percentage") {
        impact = (amountVal / 100) * base;
      } else {
        impact = amountVal;
      }
      const isDiscount = item.modifier === "discount";
      const impactSigned = isDiscount ? -impact : impact;
      return {
        id: item.id,
        name: item.name,
        type: item.type,
        description: item.description,
        modifier: item.modifier,
        amount_type: item.amount_type,
        amount: amountVal,
        impact,
        impactSigned,
        displayImpact: (isDiscount ? "-" : "+") + impact.toLocaleString() + " EGP",
        displayRate:
          item.amount_type === "percentage" ? `${amountVal}%` : `${amountVal.toLocaleString()} EGP`,
      };
    });
    const totalAdjustments = list.reduce((sum, item) => sum + item.impactSigned, 0);
    return {
      basePrice: base,
      modifiers: list,
      totalAdjustments,
      suggestedFinalAmount: Math.max(0, base + totalAdjustments),
      remainingBalance: null,
      installmentsCount: null,
      firstInstallment: null,
      firstDeadline: null,
    };
  }

  return {
    basePrice: base,
    modifiers: [],
    totalAdjustments: 0,
    suggestedFinalAmount: base,
    remainingBalance: null,
    installmentsCount: null,
    firstInstallment: null,
    firstDeadline: null,
  };
}

export function initSelectionsFromReservation(flattenedSettings) {
  const selectedSettings = {};
  if (!flattenedSettings?.length) return selectedSettings;

  flattenedSettings.forEach((ps) => {
    if (ps.type === "Paper" || ps.type === "Fees") {
      if (!selectedSettings[ps.type]) selectedSettings[ps.type] = [];
      selectedSettings[ps.type].push(ps.name);
    } else {
      selectedSettings[ps.type] = ps.name;
    }
  });

  return selectedSettings;
}

export function flattenReservationPriceSettings(priceSettings) {
  return flattenPriceSettings(priceSettings);
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

export function normalizeGradeName(name) {
  return String(name || "").replace(/[\s.>]+/g, "").toLowerCase();
}

const GRADE_EQUIVALENCE_GROUPS = [
  ["vgood", "verygood"],
  ["good"],
  ["excellent"],
  ["pass"],
  ["5yearsex"],
  ["gt45", "45"],
];

export function gradeNamesMatch(a, b) {
  const na = normalizeGradeName(a);
  const nb = normalizeGradeName(b);
  if (na === nb) return true;
  return GRADE_EQUIVALENCE_GROUPS.some((group) => group.includes(na) && group.includes(nb));
}

export function findGradeSetting(gradeName, settings) {
  if (!gradeName || !settings?.length) return null;
  return settings.find((ps) => ps.type === "Grade" && gradeNamesMatch(ps.name, gradeName));
}

export function getGradeSettingFromResponse(flattened) {
  if (!flattened?.length) return null;
  return flattened.find((ps) => ps.type === "Grade") || null;
}

export function parentConstraintSatisfied(parentSetting, selectedSettings) {
  if (!parentSetting) return false;
  const selectedVal = selectedSettings[parentSetting.type];
  if (Array.isArray(selectedVal)) {
    return selectedVal.some((v) => v === parentSetting.name || gradeNamesMatch(v, parentSetting.name));
  }
  return selectedVal === parentSetting.name || gradeNamesMatch(selectedVal, parentSetting.name);
}

export function pickDefaultPaymentMethod(paymentOptions, current) {
  if (!paymentOptions?.length) return current || "";
  if (current && paymentOptions.includes(current)) return current;
  return paymentOptions[0];
}

const USER_SELECTABLE_TYPES = new Set([
  "Payment Method",
  "Paper",
  "Grade",
]);

function buildActivePriceSettingsFromSelections(allPs, selectedSettings) {
  const list = [];

  Object.keys(selectedSettings || {}).forEach((type) => {
    const selectedName = selectedSettings[type];
    if (!selectedName) return;

    if (Array.isArray(selectedName)) {
      selectedName.forEach((name) => {
        const ps = allPs.find(
          (x) => x.type === type && (x.name === name || gradeNamesMatch(x.name, name))
        );
        if (ps) list.push(ps);
      });
    } else {
      const ps = allPs.find(
        (x) => x.type === type && (x.name === selectedName || gradeNamesMatch(x.name, selectedName))
      );
      if (ps) list.push(ps);
    }
  });

  allPs.forEach((ps) => {
    if (list.some((x) => x.id === ps.id)) return;
    if (ps.is_active === false) return;
    if (USER_SELECTABLE_TYPES.has(ps.type)) return;

    const pids = getParentIds(ps);
    if (pids.length === 0) return;

    const allParentsSatisfied = pids.every((pid) => {
      const parentObj = allPs.find((x) => x.id === pid);
      return parentConstraintSatisfied(parentObj, selectedSettings);
    });

    if (allParentsSatisfied && !selectedSettings[ps.type]) {
      list.push(ps);
    }
  });

  return list;
}

export function getParentIds(ps) {
  if (!ps) return [];
  return ps.parent_ids || ps.parent_id || (ps.parents ? ps.parents.map((p) => p.id) : []);
}

/** Sub Payment Method children for the currently selected Payment Method */
export function resolveSubPaymentMethods(allPs, selectedSettings) {
  const paymentMethodName = selectedSettings?.["Payment Method"];
  if (!paymentMethodName || !allPs?.length) return [];

  const paymentMethod = allPs.find(
    (ps) =>
      ps.type === "Payment Method" &&
      ps.is_active !== false &&
      (ps.name === paymentMethodName || gradeNamesMatch(ps.name, paymentMethodName))
  );
  if (!paymentMethod) return [];

  return allPs.filter((ps) => {
    if (ps.type !== "Sub Payment Method" || ps.is_active === false) return false;
    return getParentIds(ps).includes(paymentMethod.id);
  });
}

/** Merge Sub Payment Method entries from raw API (children under Payment Method) */
export function enrichPriceSettingsFromRawResponse(rawData, flattened) {
  if (!Array.isArray(rawData)) return flattened || [];

  const result = [...(flattened || [])];
  const addIfMissing = (ps, parentId = null) => {
    if (!ps?.id) return;
    const existing = result.find((x) => x.id === ps.id);
    if (existing) {
      if (parentId) {
        if (!existing.parent_ids) {
          existing.parent_ids = [...getParentIds(existing)];
        }
        if (!existing.parent_ids.includes(parentId)) {
          existing.parent_ids.push(parentId);
        }
      }
      return;
    }
    const entry = { ...ps };
    const existingParentIds = getParentIds(entry);
    if (parentId && !existingParentIds.includes(parentId)) {
      entry.parent_ids = [...existingParentIds, parentId];
    } else if (parentId && existingParentIds.length === 0) {
      entry.parent_ids = [parentId];
    }
    result.push(entry);
  };

  rawData.forEach((ps) => {
    if (ps.type === "Payment Method" && ps.children?.length) {
      ps.children
        .filter((c) => c.type === "Sub Payment Method")
        .forEach((child) => addIfMissing(child, ps.id));
    }
    if (ps.type === "Sub Payment Method") {
      addIfMissing(ps);
    }
  });

  return result;
}

/** Always include Grade + Sub Payment Method from API/selections in calculator payload */
export function buildActivePriceSettings(allPs, selectedSettings, gradeFromApi = null) {
  const list = buildActivePriceSettingsFromSelections(allPs, selectedSettings);

  resolveSubPaymentMethods(allPs, selectedSettings).forEach((sp) => {
    if (!list.some((x) => x.id === sp.id)) list.push(sp);
  });

  if (gradeFromApi && !list.some((x) => x.id === gradeFromApi.id)) {
    list.push(gradeFromApi);
  }

  return list;
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
  const addSetting = (ps, parentId = null) => {
    if (!ps?.id) return;
    const existing = flattened.find((x) => x.id === ps.id);
    if (existing) {
      if (parentId) {
        if (!existing.parent_ids) {
          existing.parent_ids = [...getParentIds(existing)];
        }
        if (!existing.parent_ids.includes(parentId)) {
          existing.parent_ids.push(parentId);
        }
      }
      return;
    }
    const entry = { ...ps };
    if (parentId) {
      entry.parent_ids = [parentId];
    } else {
      entry.parent_ids = entry.parent_ids || [];
    }
    flattened.push(entry);
  };

  if (!Array.isArray(data)) return flattened;

  data.forEach((ps) => {
    addSetting(ps);
    if (ps.parents && Array.isArray(ps.parents)) {
      ps.parents.forEach((parent) => addSetting(parent));
    }
    if (ps.children && Array.isArray(ps.children)) {
      ps.children.forEach((child) => {
        addSetting(child, ps.id);
        if (child.parents && Array.isArray(child.parents)) {
          child.parents.forEach((parent) => addSetting(parent));
        }
      });
    }
  });

  return flattened;
}

export function ensureGradeInPriceSettings(flattened, gradeName, allGradesFlattened) {
  if (!gradeName) return flattened;
  if (findGradeSetting(gradeName, flattened)) return flattened;
  const gradePs = findGradeSetting(gradeName, allGradesFlattened);
  if (gradePs) return [...flattened, gradePs];
  return flattened;
}

export function getOptionsForPriceSettingType(allPs, type, selectedSettings, skipParentFilter = false) {
  let settings = allPs.filter((ps) => ps.type === type && ps.is_active !== false);

  if (skipParentFilter) {
    return settings.map((ps) => ps.name);
  }

  settings = settings.filter((ps) => {
    const pids = ps.parent_ids || ps.parent_id || (ps.parents ? ps.parents.map((p) => p.id) : []);
    if (pids.length === 0) return true;

    return pids.some((pid) => {
      const parentSetting = allPs.find((x) => x.id === pid);
      return parentConstraintSatisfied(parentSetting, selectedSettings);
    });
  });

  return settings.map((ps) => ps.name);
}
