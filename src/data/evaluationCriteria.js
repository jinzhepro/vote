// 默认评分标准
export const defaultCriteria = {
  responsibility: {
    name: "责任心",
    description: "主动工作和承担责任的态度",
    options: [
      { value: 15, label: "工作非常主动，尽职尽责，公而忘私，勇于承担责任" },
      { value: 12, label: "工作主动性一般，有一定责任感，基本上能承担责任" },
      { value: 9, label: "工作不够主动，有一定本位主义，偶有推卸责任" },
      { value: 3, label: "工作很不主动，经常斤斤计较，经常推卸责任" },
    ],
  },
  diligence: {
    name: "勤勉性",
    description: "遵守规章制度情况和时间观念",
    options: [
      { value: 5, label: "严格遵守规章制度，时间观念非常强" },
      { value: 4, label: "能较好遵守规章制度，时间观念比较强" },
      { value: 3, label: "偶尔有违反规章制度现象，时间观念一般" },
      { value: 0, label: "严重违反规章制度或时间观念很差" },
    ],
  },
  dedication: {
    name: "爱岗敬业",
    description: "主要突出在服务意识方面",
    options: [
      {
        value: 15,
        label: "爱岗敬业，诚实守信，工作不受情绪影响，服务水平高，有奉献精神",
      },
      { value: 12, label: "能遵守职业操守，对待客户热情，能在一定压力下工作" },
      { value: 9, label: "基本能遵守职业操守，服务水平一般" },
      { value: 3, label: "服务水平差，常因情绪影响工作，严重影响企业形象" },
    ],
  },
  cooperation: {
    name: "合作性",
    description: "主要突出在团队合作意识方面",
    options: [
      { value: 10, label: "积极主动配合他人工作，促进团队各项工作" },
      { value: 8, label: "肯应他人要求帮助别人" },
      { value: 6, label: "仅在必要与人协调的工作上与人合作" },
      { value: 2, label: "精神散漫，不愿与人合作，偶尔甚至影响工作顺利进行" },
    ],
  },
  knowledge: {
    name: "专业知识",
    description: "工作知识、实践经验和技术能力在工作中的运用",
    options: [
      {
        value: 8,
        label:
          "对本职工作，包括工作细节非常熟悉，任何情况下进行工作，亦能应付自如，常有创新",
      },
      {
        value: 6,
        label: "正常情况下，独立完成工作，遇非例行情况时，才需要上司或他人指导",
      },
      { value: 4, label: "知识技能经验仍有限，常要他人密切指导" },
      { value: 1, label: "知识及技能不足以执行本岗位工作基本要求" },
    ],
  },
  judgment: {
    name: "判断能力",
    description: "判断工作问题轻重缓急或决策能力",
    options: [
      {
        value: 7,
        label: "在任何情况下，皆表现出准确的判断及组织安排能力，能及时总结",
      },
      { value: 5, label: "在重要情况下，能独立判断，并选择恰当的方法予以处理" },
      { value: 3, label: "常需要上级指导，才能辨别问题所在轻重缓急" },
      { value: 0, label: "完全不能判别轻重，对工作造成较大影响" },
    ],
  },
  learning: {
    name: "学习能力",
    description: "对专业知识学习的主动性和效果",
    options: [
      {
        value: 10,
        label:
          "主动学习岗位所需的专业知识，接受新知识速度快，能较好地用于改善工作业绩",
      },
      { value: 8, label: "为适应新的工作要求可用心学习岗位所需的专业知识" },
      { value: 6, label: "学习主动性一般，能配合执行工作中的新要求" },
      { value: 2, label: "学习主动性差，对工作中的新要求有抵触情绪" },
    ],
  },
  effectiveness: {
    name: "工作成效",
    description: "岗位职责履行情况",
    options: [
      {
        value: 10,
        label:
          "工作业绩突出，工作有计划有重点，能很好地履行岗位职责，很好地完成计划内外工作",
      },
      {
        value: 8,
        label:
          "工作业绩较好，工作有计划，能较好地履行岗位职责，较好地完成计划内外工作",
      },
      {
        value: 6,
        label: "工作业绩一般，工作有一定计划，但计划内外工作任务有时难以兼顾",
      },
      { value: 2, label: "需要在指导督促下工作，工作任务有时难以完成" },
    ],
  },
  quality: {
    name: "工作质量",
    description: "完成工作规定之标准及准确性",
    options: [
      { value: 10, label: "工作质量优，并经常自我改善" },
      { value: 8, label: "差错、投诉等较少，基本达到工作要求" },
      {
        value: 6,
        label: "需在指导下才能做好，工作质量不太稳定，偶尔存在返工现象",
      },
      { value: 2, label: "最低要求未达到，在指导下工作，仍常有错误或返工" },
    ],
  },
  efficiency: {
    name: "工作效率",
    description: "指定期限内完成指定工作的数量",
    options: [
      {
        value: 10,
        label:
          "经常提前完成工作，保质保量甚至督促上级或其他部门，能有效控制不利因素",
      },
      {
        value: 8,
        label: "在规定时限内按时完成工作，极少要上级催促，能适当控制不利因素",
      },
      { value: 6, label: "偶有工作拖延（个人原因），工作时效性稍逊" },
      { value: 2, label: "工作拖拉，经常推迟工作进度，工作效率持续低于要求" },
    ],
  },
};

// 获取评分标准的函数
export const getEvaluationCriteria = () => {
  return defaultCriteria;
};

// 计算总分的函数
export const calculateTotalScore = (evaluations) => {
  return Object.values(evaluations).reduce((sum, score) => sum + score, 0);
};

// 获取评分标准名称列表的函数
export const getCriteriaNames = () => {
  return Object.keys(defaultCriteria);
};

// 获取评分标准详情的函数
export const getCriteriaDetails = (criterionKey) => {
  return defaultCriteria[criterionKey];
};

// 获取最高可能总分的函数
export const getMaxPossibleScore = () => {
  return Object.values(defaultCriteria).reduce((sum, criterion) => {
    const maxScore = Math.max(
      ...criterion.options.map((option) => option.value)
    );
    return sum + maxScore;
  }, 0);
};

// 获取评分等级的函数
export const getScoreGrade = (score) => {
  const maxScore = getMaxPossibleScore();
  const percentage = (score / maxScore) * 100;

  if (percentage >= 95)
    return { grade: "优秀", color: "text-green-600", letter: "A" };
  if (percentage >= 85)
    return { grade: "良好", color: "text-blue-600", letter: "B" };
  if (percentage >= 75)
    return { grade: "合格", color: "text-yellow-600", letter: "C" };
  if (percentage >= 65)
    return { grade: "基本合格", color: "text-orange-600", letter: "D" };
  return { grade: "不合格", color: "text-red-600", letter: "E" };
};

// 获取评分等级详情的函数
export const getGradeDetails = () => {
  return [
    {
      min: 95,
      max: 100,
      grade: "优秀",
      letter: "A",
      color: "text-green-600",
      description: "95分≤优秀≤100分，经控贸易A≤11人，开投贸易A≤4人",
    },
    {
      min: 85,
      max: 95,
      grade: "良好",
      letter: "B",
      color: "text-blue-600",
      description: "85分≤良好<95分，经控贸易B=23-26人，开投贸易B=9-11人",
    },
    {
      min: 75,
      max: 85,
      grade: "合格",
      letter: "C",
      color: "text-yellow-600",
      description: "75分≤合格<85分，经控贸易C=18-21人，开投贸易C=6-8人",
    },
    {
      min: 65,
      max: 75,
      grade: "基本合格",
      letter: "D",
      color: "text-orange-600",
      description: "65分≤基本合格<75分，经控贸易D+E=3-6人，开投贸易D+E=1-3人",
    },
    {
      min: 0,
      max: 65,
      grade: "不合格",
      letter: "E",
      color: "text-red-600",
      description: "65分以下为不合格，与D等级合并计算分布",
    },
  ];
};

// 验证等级分布是否符合要求
export const validateGradeDistribution = (evaluations, department) => {
  // 根据不同部门设置不同的验证规则
  let validationRules;
  let departmentName;

  if (department === "jingkong") {
    // 经控贸易部门规则
    validationRules = {
      A: { max: 11, description: "≤11人" },
      B: { min: 23, max: 26, description: "23-26人" },
      C: { min: 18, max: 21, description: "18-21人" },
      DE: { min: 3, max: 6, description: "3-6人" },
    };
    departmentName = "经控贸易";
  } else if (department === "kaitou") {
    // 开投贸易部门规则
    validationRules = {
      A: { max: 4, description: "≤4人" },
      B: { min: 9, max: 11, description: "9-11人" },
      C: { min: 6, max: 8, description: "6-8人" },
      DE: { min: 1, max: 3, description: "1-3人" },
    };
    departmentName = "开投贸易";
  } else {
    // 其他部门不需要等级分布验证
    return { valid: true, message: "该部门不需要等级分布验证" };
  }

  // 统计各等级人数
  const gradeCounts = {
    A: 0, // 优秀
    B: 0, // 良好
    C: 0, // 合格
    D: 0, // 基本合格
    E: 0, // 不合格
  };

  // 计算每个评价的等级
  Object.values(evaluations).forEach((evaluation) => {
    const grade = getScoreGrade(evaluation.totalScore);
    gradeCounts[grade.letter]++;
  });

  const totalEvaluated = Object.keys(evaluations).length;

  const aCount = gradeCounts.A;
  const bCount = gradeCounts.B;
  const cCount = gradeCounts.C;
  const deCount = gradeCounts.D + gradeCounts.E;

  // 检查A等级
  if (aCount > validationRules.A.max) {
    return {
      valid: false,
      message: `${departmentName}部门：A等级（优秀）人数不能超过${validationRules.A.max}人，当前为${aCount}人`,
      details: {
        current: {
          A: aCount,
          B: bCount,
          C: cCount,
          D: gradeCounts.D,
          E: gradeCounts.E,
        },
        required: {
          A: validationRules.A.description,
          B: validationRules.B.description,
          C: validationRules.C.description,
          "D+E": validationRules.DE.description,
        },
        totalEvaluated,
        department,
      },
    };
  }

  // 检查B等级
  if (bCount < validationRules.B.min || bCount > validationRules.B.max) {
    return {
      valid: false,
      message: `${departmentName}部门：B等级（良好）人数应在${validationRules.B.description}之间，当前为${bCount}人`,
      details: {
        current: {
          A: aCount,
          B: bCount,
          C: cCount,
          D: gradeCounts.D,
          E: gradeCounts.E,
        },
        required: {
          A: validationRules.A.description,
          B: validationRules.B.description,
          C: validationRules.C.description,
          "D+E": validationRules.DE.description,
        },
        totalEvaluated,
        department,
      },
    };
  }

  // 检查C等级
  if (cCount < validationRules.C.min || cCount > validationRules.C.max) {
    return {
      valid: false,
      message: `${departmentName}部门：C等级（合格）人数应在${validationRules.C.description}之间，当前为${cCount}人`,
      details: {
        current: {
          A: aCount,
          B: bCount,
          C: cCount,
          D: gradeCounts.D,
          E: gradeCounts.E,
        },
        required: {
          A: validationRules.A.description,
          B: validationRules.B.description,
          C: validationRules.C.description,
          "D+E": validationRules.DE.description,
        },
        totalEvaluated,
        department,
      },
    };
  }

  // 检查D+E等级
  if (deCount < validationRules.DE.min || deCount > validationRules.DE.max) {
    return {
      valid: false,
      message: `${departmentName}部门：D等级（基本合格）+ E等级（不合格）人数应在${validationRules.DE.description}之间，当前为${deCount}人`,
      details: {
        current: {
          A: aCount,
          B: bCount,
          C: cCount,
          D: gradeCounts.D,
          E: gradeCounts.E,
        },
        required: {
          A: validationRules.A.description,
          B: validationRules.B.description,
          C: validationRules.C.description,
          "D+E": validationRules.DE.description,
        },
        totalEvaluated,
        department,
      },
    };
  }

  // 检查总人数是否合理
  const expectedTotal = aCount + bCount + cCount + deCount;
  if (expectedTotal !== totalEvaluated) {
    return {
      valid: false,
      message: `评价数据不一致，请检查所有人员是否都已评价`,
      details: {
        current: {
          A: aCount,
          B: bCount,
          C: cCount,
          D: gradeCounts.D,
          E: gradeCounts.E,
        },
        required: {
          A: validationRules.A.description,
          B: validationRules.B.description,
          C: validationRules.C.description,
          "D+E": validationRules.DE.description,
        },
        totalEvaluated,
        calculatedTotal: expectedTotal,
        department,
      },
    };
  }

  return {
    valid: true,
    message: `${departmentName}部门等级分布符合要求`,
    details: {
      current: {
        A: aCount,
        B: bCount,
        C: cCount,
        D: gradeCounts.D,
        E: gradeCounts.E,
      },
      required: {
        A: validationRules.A.description,
        B: validationRules.B.description,
        C: validationRules.C.description,
        "D+E": validationRules.DE.description,
      },
      totalEvaluated,
      department,
    },
  };
};

// 获取等级分布建议
export const getGradeDistributionSuggestions = (evaluations, department) => {
  const validation = validateGradeDistribution(evaluations, department);
  if (validation.valid) {
    return [];
  }

  const suggestions = [];
  const { current, required } = validation.details;

  // 根据部门获取限制值
  let limits;
  if (department === "jingkong") {
    limits = {
      A: 11,
      B: { min: 23, max: 26 },
      C: { min: 18, max: 21 },
      DE: { min: 3, max: 6 },
    };
  } else if (department === "kaitou") {
    limits = {
      A: 4,
      B: { min: 9, max: 11 },
      C: { min: 6, max: 8 },
      DE: { min: 1, max: 3 },
    };
  } else {
    return [];
  }

  // A等级过多
  if (current.A > limits.A) {
    suggestions.push({
      type: "A过高",
      message: `A等级人数过多，需要调整${current.A - limits.A}个`,
      action: "降低部分A等级评分",
    });
  }

  // B等级不在范围内
  if (current.B < limits.B.min) {
    suggestions.push({
      type: "B过低",
      message: `B等级人数不足，需要调整${limits.B.min - current.B}个`,
      action: "提高部分C/D/E等级评分",
    });
  } else if (current.B > limits.B.max) {
    suggestions.push({
      type: "B过高",
      message: `B等级人数过多，需要调整${current.B - limits.B.max}个`,
      action: "降低部分B等级评分",
    });
  }

  // C等级不在范围内
  if (current.C < limits.C.min) {
    // 检查是否已经有相同的建议（避免重复）
    const hasSimilarSuggestion = suggestions.some((s) => s.type === "B过高");

    if (!hasSimilarSuggestion) {
      suggestions.push({
        type: "C过低",
        message: `C等级人数不足，需要调整${limits.C.min - current.C}个`,
        action: "提高部分D/E等级评分",
      });
    }
  } else if (current.C > limits.C.max) {
    suggestions.push({
      type: "C过高",
      message: `C等级人数过多，需要调整${current.C - limits.C.max}个`,
      action: "降低部分C等级评分",
    });
  }

  // D+E等级不在范围内
  const deCount = current.D + current.E;
  if (deCount < limits.DE.min) {
    // 检查是否已经有相同的建议（避免重复）
    const hasSimilarSuggestion = suggestions.some(
      (s) => s.type === "B过高" || s.type === "C过高"
    );

    if (!hasSimilarSuggestion) {
      suggestions.push({
        type: "D+E过低",
        message: `D+E等级人数不足，需要调整${limits.DE.min - deCount}个`,
        action: "降低部分B/C等级评分",
      });
    }
  } else if (deCount > limits.DE.max) {
    suggestions.push({
      type: "D+E过高",
      message: `D+E等级人数过多，需要调整${deCount - limits.DE.max}个`,
      action: "提高部分D/E等级评分",
    });
  }

  return suggestions;
};
