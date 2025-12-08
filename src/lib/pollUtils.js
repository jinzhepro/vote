// 投票工具函数

// 生成唯一的投票ID
export function generatePollId() {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

// 获取所有投票
export function getAllPolls() {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem("polls") || "[]");
}

// 保存所有投票
export function saveAllPolls(polls) {
  if (typeof window === "undefined") return;
  localStorage.setItem("polls", JSON.stringify(polls));
}

// 根据ID获取投票
export function getPollById(id) {
  const polls = getAllPolls();
  return polls.find((poll) => poll.id === id);
}

// 创建新投票
export function createPoll(pollData) {
  const polls = getAllPolls();
  const newPoll = {
    id: generatePollId(),
    ...pollData,
    createdAt: new Date().toISOString(),
    votes: [],
  };
  polls.push(newPoll);
  saveAllPolls(polls);
  return newPoll;
}

// 更新投票
export function updatePoll(id, updatedData) {
  const polls = getAllPolls();
  const index = polls.findIndex((poll) => poll.id === id);
  if (index !== -1) {
    polls[index] = { ...polls[index], ...updatedData };
    saveAllPolls(polls);
    return polls[index];
  }
  return null;
}

// 删除投票
export function deletePoll(id) {
  const polls = getAllPolls();
  const filteredPolls = polls.filter((poll) => poll.id !== id);
  saveAllPolls(filteredPolls);
  return filteredPolls.length < polls.length;
}

// 添加投票
export function addVote(pollId, selectedOptions) {
  const polls = getAllPolls();
  const pollIndex = polls.findIndex((poll) => poll.id === pollId);

  if (pollIndex !== -1) {
    const newVote = {
      options: selectedOptions,
      timestamp: new Date().toISOString(),
    };

    polls[pollIndex].votes.push(newVote);
    saveAllPolls(polls);
    return polls[pollIndex];
  }
  return null;
}

// 检查用户是否已投票
export function hasUserVoted(pollId) {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem(`voted_${pollId}`);
}

// 标记用户已投票
export function markUserVoted(pollId) {
  if (typeof window === "undefined") return;
  localStorage.setItem(`voted_${pollId}`, "true");
}

// 计算投票结果
export function calculatePollResults(poll) {
  if (!poll || poll.votes.length === 0) {
    return poll.options.map((option, index) => ({
      option,
      votes: 0,
      percentage: 0,
    }));
  }

  const optionCounts = {};
  poll.options.forEach((_, index) => {
    optionCounts[index] = 0;
  });

  poll.votes.forEach((vote) => {
    vote.options.forEach((optionIndex) => {
      optionCounts[optionIndex]++;
    });
  });

  return poll.options.map((option, index) => ({
    option,
    votes: optionCounts[index],
    percentage: ((optionCounts[index] / poll.votes.length) * 100).toFixed(1),
  }));
}

// 获取领先选项
export function getLeadingOption(poll) {
  if (!poll || poll.votes.length === 0) return null;

  const results = calculatePollResults(poll);
  const leading = results.reduce((max, current) =>
    current.votes > max.votes ? current : max
  );

  return leading.votes > 0 ? leading : null;
}

// 格式化日期
export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// 搜索投票
export function searchPolls(query) {
  const polls = getAllPolls();
  if (!query.trim()) return polls;

  const lowercaseQuery = query.toLowerCase();
  return polls.filter(
    (poll) =>
      poll.question.toLowerCase().includes(lowercaseQuery) ||
      poll.options.some((option) =>
        option.toLowerCase().includes(lowercaseQuery)
      )
  );
}
