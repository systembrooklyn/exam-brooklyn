# Research: Risks & UX Impacts of Department Prefill (v1.4) and Related Form Flows

**Task ID:** job-request-prefill  
**Date:** 2026-09-14  
**Status:** Complete  
**Mode:** Standard (internal + external)  
**Focus:** What can go wrong after hardening Department auto-fill (+ interactions with overlay, capacity, requirements)

---

## Executive Summary

خطوة v1.4 (ملء Department من Position / nested requirement / `getPosition` fallback) تحسّن اكتمال الفورم، لكنها تدخل مخاطر UX وتشغيلية: **overwrite لقيمة المستخدم**، **طلبات شبكة زيادة**، **تطويل الـ overlay**، و**تعارض محتمل بين مصدرين للـ department** (query Manpower vs Position vs requirement.nested).

من ناحية UX العامة: الـ autofill مفيد لما يكون المصدر موثوق وواضح؛ مضر لما يمسح اختيار المستخدم بدون إشارة، أو لما الـ loading يمنع التفاعل أطول من اللازم.

**التوصية الأولية:** الإبقاء على auto-fill Department عند تغيير Position (overwrite مقصود)، مع تخفيف الـ `getPosition` fallback (فقط لو القائمة فاضية فعلًا)، وعدم اعتبار requirements مصدر department أساسي (الـ schema مفيهوش الحقل).

---

## Codebase Analysis

### Existing Pattern: Multi-source Department resolve

**Location:** `src/views/recruitment/JobRequestForm.vue` — `resolvePositionDepartmentId`, `fetchAndApplyRequirementsForPosition`

**How it works:**
1. يحاول department من كائن الـ requirement (لو API رجّع nested `position.department*`)
2. وإلا من `positionsStore.positions` list
3. وإلا `positionsStore.getPosition(id)` كـ fallback
4. يكتب `form.department_id` (overwrite عند كل اختيار Position يدوي)

**Reusability:** نفس فكرة Manpower `deptId` من الـ position object.

### Related shipped behaviors that interact

| Behavior | Risk interaction with Department fill |
|----------|----------------------------------------|
| Form-wide overlay (`formProcessBusy`) | `fieldLoading.department = true` يطيل الـ overlay طوال `getRequirements` + optional `getPosition` |
| Capacity Path C | Parallel مع requirements؛ المستخدم يشوف overlay ثم ممكن بانر block — Department يتملّى حتى لو الطلب ممنوع (مقبول) |
| Notes / employment overwrite | نفس نمط overwrite؛ المستخدم اللي عدّل Department يدويًا ثم غيّر Position هيخس اختياره |
| Path A Manpower query | لو `department_id` في الـ query غلط/فاضي، v1.4 بيملأ من Position — إيجابي؛ لو الـ query كان مقصود مختلف عن Position.department نادرًا (conflict) |
| First-selection flush | يقلل حالة Department فاضي بعد أول اختيار — يقلل risk القديم |

### Conventions to Follow

- String-coerce IDs على `<select>` (موجود)
- Manual create فقط لـ Path B/C
- Fail closed على capacity؛ requirements fail soft

---

## Risk Catalog (Problems that can happen)

### R1 — Overwrite لـ Department بعد تعديل المستخدم (High UX impact)

**Scenario:** المستخدم اختار Position → Department اتملّى → عدّل Department يدويًا → غيّر Position تاني (أو نفس الـ flush أعاد التشغيل) → Department يتكتب من المصدر التلقائي.

**Impact:** إحساس إن النظام “بيفرض” قيمة؛ بيانات خاطئة لو الـ hire فعليًا لقسم تاني نادرًا.

**Likelihood:** Medium (كل تغيير Position).

**Mitigation options:**
- A) Keep overwrite (الحالي) — Position يحدد Department دائمًا  
- B) Fill only if empty  
- C) Soft hint banner “Department updated from position”

**Fit:** A مناسب لو القاعدة التنظيمية: Position مرتبط بقسم واحد (زي صفحة Positions).

---

### R2 — Extra `getPosition` network call (Medium performance)

**Scenario:** لو `department_id` مش موجود في list item (API list ناقص relations)، كل اختيار Position يعمل GET إضافي بعد requirements.

**Impact:** أبطأ overlay؛ ضغط API؛ على شبكة ضعيفة UX أسوأ.

**Likelihood:** Medium–High لو list payload خفيف.

**Mitigation:** استدعِ `getPosition` فقط إذا `resolvePositionDepartmentId` فاضي **وبعد** ما `positions.length > 0` تأكد إن العنصر موجود بدون dept؛ cache نتيجة الـ single في الـ list.

---

### R3 — Overlay أطول / إحساس “تجميد” الفورم (Medium UX)

**Scenario:** Overlay يغطي الكارت كامل أثناء requirements + department loading + capacity. المستخدم مش هيقدر يعدّل Requested By أثناء الانتظار.

**Impact:** واضح إن في process (هدف v1.3) لكن ممكن يحس إنه مقيّد؛ لو الـ API بطيء يبان “عطل”.

**Likelihood:** Medium.

**Mitigation:** الإبقاء على overlay قصير؛ timeout رسالة؛ أو السماح بتفاعل الحقول غير المتأثرة (أثقل تنفيذًا).

---

### R4 — Department يظهر ممتلئ والطلب Blocked (Low–Medium cognitive)

**Scenario:** Position ممتلئ manpower → بانر أحمر + Department/Budget اتملّوا.

**Impact:** المستخدم يفهم إن البيانات جاهزة لكن Create مقفول — مش bug، بس يحتاج وضوح إن الـ prefill مش معناه “مسموح”.

**Likelihood:** High في سيناريو filled.

**Mitigation:** البانر الحالي كافي؛ ممكن جملة: “Fields were filled from position data, but hiring is blocked until vacancy opens.”

---

### R5 — تعارض Manpower query dept vs Position dept (Low)

**Scenario:** Path A يمرّر `department_id` من query؛ لو اختلف عن `position.department_id` (بيانات قديمة/bug في Manpower row)، الكود الحالي يفضّل الـ query لو موجود.

**Impact:** ندرة؛ بيانات غير متسقة لو الـ query غلط.

**Likelihood:** Low (بعد إصلاح `deptId`).

**Mitigation:** لو query موجود ومتخالف مع Position، فضّل Position أو أظهر تحذير.

---

### R6 — Stale race رغم requestSeq (Low)

**Scenario:** تغيير Position بسرعة؛ `getPosition` لطلب قديم لو seq check ناقص قبل assign — الكود يفحص `seq === requirementsReqSeq` قبل كتابة department (محمي).

**Impact:** قيمة قسم لـ Position غلط لو فشل الـ guard.

**Likelihood:** Low (الحماية موجودة).

---

### R7 — Position بدون department في النظام (Low)

**Scenario:** Position قديم بدون `department_id`؛ كل الـ fallbacks ترجع فاضي.

**Impact:** Department يفضل مطلوب يدويًا — طبيعي.

**Likelihood:** Low–Medium حسب جودة البيانات.

---

### R8 — Notes/Budget overwrite تفاقم مع Department (Medium cumulative UX)

**Scenario:** تغيير Position يمسح notes اللي كتبها المستخدم (overwrite mode) + يغيّر Department + Budget.

**Impact:** تراكم إحساس فقدان التحكم؛ مش خاص بـ Department بس يتفاقم معه.

**Mitigation (منفصل):** overwrite فقط للحقول المشتقة؛ notes fillEmpty فقط؛ أو تأكيد قبل overwrite.

---

## External Solutions / Practices

### Option 1: Authoritative linked-field overwrite (current direction)

**What it is:** لما يتغير الـ parent (Position)، الحقول التابعة (Department) تتحدث إجبارًا.

**Pros:** اتساق مع نموذج البيانات؛ أقل أخطاء submit  
**Cons:** يمسح تعديل يدوي  
**Fit:** High — Position↔Department علاقة 1:1 في HR هنا

### Option 2: Fill-if-empty only

**Pros:** يحترم تعديلات المستخدم  
**Cons:** Position جديد + Department قديم = بيانات غير منطقية  
**Fit:** Medium

### Option 3: Confirm / toast on overwrite

**Pros:** شفافية  
**Cons:** ضوضاء في كل تغيير Position  
**Fit:** Medium as soft toast once

### Industry notes (autofill UX)

- Autofill يقلل الاحتكاك لما المصدر موثوق (Uxcel / form UX guides).
- Overwrite الصامت لقيم موجودة يسبب mistrust (شائع في browser autofill bugs على controlled forms).
- أظهر حالة تحميل واضحة وامنع الـ submit أثناء الـ flight (موجود عندنا عبر overlay + `canSubmit`).

---

## Comparison Matrix

| Criteria | Overwrite always (now) | Fill-if-empty | Toast + overwrite |
|----------|------------------------|---------------|-------------------|
| Data consistency | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| Respect user edits | ⭐ | ⭐⭐⭐ | ⭐⭐ |
| Implementation cost | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| UX clarity | ⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| Fit for Position→Dept | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |

---

## Recommendations

### Primary Recommendation

1. **أبقِ overwrite لـ Department عند تغيير Position** — متسق مع أن القسم تابع للـ Position.
2. **قيّد `getPosition` fallback** — فقط إذا العنصر في الـ list موجود وبدون dept، أو مش موجود أصلًا؛ تجنب استدعاء دائم.
3. **وثّق للمستخدم ضمنيًا** عبر الـ overlay فقط؛ لا تحتاج remount.
4. راقب R8 (notes overwrite) كـ follow-up منفصل لو اشتكى HR.

### Alternative Approach

Fill-if-empty لـ Department فقط في Path A (Manpower) لو الـ query جوّال؛ overwrite في Path B.

---

## Open Questions

1. هل مسموح تنظيميًا إن Job Request يكون بقسم مختلف عن قسم الـ Position؟ لو لا → overwrite صحيح 100%.
2. هل list positions API دائمًا بيرجع `department_id`؟ لو نعم → ممكن حذف `getPosition` fallback.
3. هل نغيّر notes لـ fillEmpty بدل overwrite لتقليل فقدان نص المستخدم؟

---

## Next Steps

1. Review with product/HR: هل Department قابل للتعديل بعد اختيار Position؟
2. Optional `/evolve` لتخفيف `getPosition` أو toast خفيف
3. Smoke test: Position with dept / without dept / rapid switch / blocked capacity

---

*Research completed with SDD 6.0*
