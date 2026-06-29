import { computed, unref } from "vue";
import {
  buildActivePriceSettings,
  buildCalculatedBreakdown,
  getOptionsForPriceSettingType,
  pickDefaultPaymentMethod,
} from "@/utils/scholarshipPlanResponse";

export function useScholarshipPricing({
  priceSettings,
  selections,
  resolvedGradeSetting = null,
  apiCalculationResult = null,
  basePrice = 0,
}) {
  const activePriceSettings = computed(() =>
    buildActivePriceSettings(
      unref(priceSettings),
      unref(selections),
      unref(resolvedGradeSetting)
    )
  );

  const calculatedBreakdown = computed(() =>
    buildCalculatedBreakdown(
      unref(apiCalculationResult),
      unref(basePrice),
      activePriceSettings.value
    )
  );

  const priceSettingTypes = computed(() => {
    const settings = unref(priceSettings) || [];
    const activeTypes = settings
      .filter(
        (ps) =>
          ps.is_active !== false &&
          ps.type !== "Grade" &&
          ps.type !== "Sub Payment Method"
      )
      .map((ps) => ps.type);
    return [...new Set(activeTypes)];
  });

  const getOptionsForType = (type) =>
    getOptionsForPriceSettingType(
      unref(priceSettings),
      type,
      unref(selections)
    );

  const syncFeesAndPaymentDefaults = (selectionsRef) => {
    const feesOptions = getOptionsForType("Fees");
    if (feesOptions.length) {
      selectionsRef.value["Fees"] = feesOptions;
    }
    const paymentOptions = getOptionsForType("Payment Method");
    const current = selectionsRef.value["Payment Method"];
    const next = pickDefaultPaymentMethod(paymentOptions, current);
    if (next && next !== current) {
      selectionsRef.value["Payment Method"] = next;
    }
  };

  return {
    activePriceSettings,
    calculatedBreakdown,
    priceSettingTypes,
    getOptionsForType,
    syncFeesAndPaymentDefaults,
  };
}
