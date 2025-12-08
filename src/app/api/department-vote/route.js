import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

// 评分标准定义
const evaluationCriteria = {
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
  professionalism: {
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
  performance: {
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

// 获取投票结果
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const department = searchParams.get("department");
    const userId = searchParams.get("userId");

    if (!department) {
      return NextResponse.json(
        { success: false, error: "缺少部门参数" },
        { status: 400 }
      );
    }

    const votes = await redis.hgetall(`votes:${department}`);
    const criteria = await redis.hgetall(`criteria:${department}`);

    // 获取用户评价历史（如果提供了userId）
    let userEvaluations = {};
    if (userId) {
      userEvaluations = await redis.hgetall(`user_evaluations:${department}`);
      // 过滤出当前用户的评价
      const currentUserEvaluations = {};
      Object.entries(userEvaluations).forEach(([key, evaluation]) => {
        if (key.startsWith(`${userId}:`)) {
          const personId = key.split(":")[1];
          currentUserEvaluations[personId] = evaluation;
        }
      });
      userEvaluations = currentUserEvaluations;
    }

    return NextResponse.json({
      success: true,
      votes: votes || {},
      criteria: criteria || evaluationCriteria,
      userEvaluations: userEvaluations || {},
    });
  } catch (error) {
    console.error("获取投票失败:", error);
    return NextResponse.json(
      { success: false, error: "获取投票失败" },
      { status: 500 }
    );
  }
}

// 提交投票
export async function POST(request) {
  try {
    const { department, personId, evaluations, userId } = await request.json();

    if (!department || !personId || !evaluations) {
      return NextResponse.json(
        { success: false, error: "请提供完整的投票信息" },
        { status: 400 }
      );
    }

    // 验证评分标准
    for (const [criterion, score] of Object.entries(evaluations)) {
      if (!evaluationCriteria[criterion]) {
        return NextResponse.json(
          { success: false, error: `无效的评分标准: ${criterion}` },
          { status: 400 }
        );
      }

      const validScores = evaluationCriteria[criterion].options.map(
        (opt) => opt.value
      );
      if (!validScores.includes(score)) {
        return NextResponse.json(
          { success: false, error: `无效的分数: ${criterion}` },
          { status: 400 }
        );
      }
    }

    // 计算总分
    const totalScore = Object.values(evaluations).reduce(
      (sum, score) => sum + score,
      0
    );

    // 生成用户ID（如果没有提供）
    const currentUserId = userId || request.ip || "anonymous";

    // 存储投票结果
    const voteData = {
      personId,
      evaluations,
      totalScore,
      timestamp: new Date().toISOString(),
      ip: request.ip || "unknown",
      userId: currentUserId,
    };

    await redis.hset(
      `votes:${department}`,
      `${personId}:${Date.now()}`,
      voteData
    );

    // 记录投票历史
    await redis.lpush(`vote_history:${department}`, voteData);

    // 记录用户评价历史 - 使用用户ID作为键
    await redis.hset(
      `user_evaluations:${department}`,
      `${currentUserId}:${personId}`,
      {
        personId,
        evaluations,
        totalScore,
        timestamp: new Date().toISOString(),
      }
    );

    // 获取更新后的投票结果
    const updatedVotes = await redis.hgetall(`votes:${department}`);

    return NextResponse.json({
      success: true,
      message: "投票成功",
      votes: updatedVotes,
      totalScore,
    });
  } catch (error) {
    console.error("投票失败:", error);
    return NextResponse.json(
      { success: false, error: "投票失败" },
      { status: 500 }
    );
  }
}

// 重置投票
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const department = searchParams.get("department");

    if (!department) {
      return NextResponse.json(
        { success: false, error: "缺少部门参数" },
        { status: 400 }
      );
    }

    await redis.del(`votes:${department}`);
    await redis.del(`vote_history:${department}`);
    await redis.del(`user_evaluations:${department}`);

    return NextResponse.json({
      success: true,
      message: "投票已重置",
    });
  } catch (error) {
    console.error("重置投票失败:", error);
    return NextResponse.json(
      { success: false, error: "重置投票失败" },
      { status: 500 }
    );
  }
}

// 初始化评分标准
export async function PUT(request) {
  try {
    const { department } = await request.json();

    if (!department) {
      return NextResponse.json(
        { success: false, error: "缺少部门参数" },
        { status: 400 }
      );
    }

    // 使用 hmset 来存储整个对象
    // 逐个设置每个评分标准
    for (const [key, criterion] of Object.entries(evaluationCriteria)) {
      await redis.hset(`criteria:${department}`, key, criterion);
    }

    return NextResponse.json({
      success: true,
      message: "评分标准已初始化",
      criteria: evaluationCriteria,
    });
  } catch (error) {
    console.error("初始化评分标准失败:", error);
    return NextResponse.json(
      { success: false, error: "初始化评分标准失败" },
      { status: 500 }
    );
  }
}

// 获取所有系统的统计数据
export async function PATCH() {
  try {
    const departments = ["jingkong", "kaitou", "kaitou-dispatch"];
    const allStats = {};

    for (const dept of departments) {
      const votes = await redis.hgetall(`votes:${dept}`);
      const userEvaluations = await redis.hgetall(`user_evaluations:${dept}`);

      // 统计每个部门的评价数据
      const personStats = {};
      const results = Object.values(votes || {});

      results.forEach((vote) => {
        const personId = vote.personId;
        if (!personStats[personId]) {
          personStats[personId] = {
            personId,
            count: 0,
            totalScore: 0,
            averageScore: 0,
            evaluations: {},
          };
        }

        personStats[personId].count++;
        personStats[personId].totalScore += vote.totalScore;

        // 统计各项评分
        Object.entries(vote.evaluations).forEach(([criterion, score]) => {
          if (!personStats[personId].evaluations[criterion]) {
            personStats[personId].evaluations[criterion] = {
              total: 0,
              count: 0,
            };
          }
          personStats[personId].evaluations[criterion].total += score;
          personStats[personId].evaluations[criterion].count++;
        });
      });

      // 计算平均分
      Object.values(personStats).forEach((stat) => {
        stat.averageScore = stat.totalScore / stat.count;
        Object.values(stat.evaluations).forEach((evalStat) => {
          evalStat.average = evalStat.total / evalStat.count;
        });
      });

      allStats[dept] = {
        totalVotes: results.length,
        totalEvaluations: Object.keys(userEvaluations || {}).length,
        personStats,
        departmentName:
          {
            jingkong: "经控贸易",
            kaitou: "开投贸易",
            "kaitou-dispatch": "开投贸易派遣",
          }[dept] || dept,
      };
    }

    return NextResponse.json({
      success: true,
      stats: allStats,
    });
  } catch (error) {
    console.error("获取统计数据失败:", error);
    return NextResponse.json(
      { success: false, error: "获取统计数据失败" },
      { status: 500 }
    );
  }
}
