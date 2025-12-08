import { useState, useEffect } from "react";
import {
  getAllPolls,
  getPollById,
  createPoll,
  updatePoll,
  deletePoll,
  addVote,
  hasUserVoted,
  markUserVoted,
  searchPolls,
} from "@/lib/pollUtils";

export function usePolls() {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPolls = () => {
      try {
        const allPolls = getAllPolls();
        setPolls(allPolls);
      } catch (error) {
        console.error("Failed to load polls:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPolls();
  }, []);

  const refreshPolls = () => {
    const allPolls = getAllPolls();
    setPolls(allPolls);
  };

  const createNewPoll = (pollData) => {
    try {
      const newPoll = createPoll(pollData);
      setPolls((prev) => [...prev, newPoll]);
      return newPoll;
    } catch (error) {
      console.error("Failed to create poll:", error);
      throw error;
    }
  };

  const updateExistingPoll = (id, updatedData) => {
    try {
      const updatedPoll = updatePoll(id, updatedData);
      if (updatedPoll) {
        setPolls((prev) =>
          prev.map((poll) => (poll.id === id ? updatedPoll : poll))
        );
      }
      return updatedPoll;
    } catch (error) {
      console.error("Failed to update poll:", error);
      throw error;
    }
  };

  const deleteExistingPoll = (id) => {
    try {
      const success = deletePoll(id);
      if (success) {
        setPolls((prev) => prev.filter((poll) => poll.id !== id));
      }
      return success;
    } catch (error) {
      console.error("Failed to delete poll:", error);
      throw error;
    }
  };

  const submitVote = (pollId, selectedOptions) => {
    try {
      const updatedPoll = addVote(pollId, selectedOptions);
      if (updatedPoll) {
        markUserVoted(pollId);
        setPolls((prev) =>
          prev.map((poll) => (poll.id === pollId ? updatedPoll : poll))
        );
      }
      return updatedPoll;
    } catch (error) {
      console.error("Failed to submit vote:", error);
      throw error;
    }
  };

  const search = (query) => {
    return searchPolls(query);
  };

  return {
    polls,
    loading,
    refreshPolls,
    createPoll: createNewPoll,
    updatePoll: updateExistingPoll,
    deletePoll: deleteExistingPoll,
    submitVote,
    hasUserVoted,
    search,
  };
}

export function usePoll(pollId) {
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPoll = () => {
      try {
        setLoading(true);
        const foundPoll = getPollById(pollId);
        if (foundPoll) {
          setPoll(foundPoll);
          setError(null);
        } else {
          setError("Poll not found");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (pollId) {
      loadPoll();
    }
  }, [pollId]);

  const updatePollData = (updatedData) => {
    try {
      const updatedPoll = updatePoll(pollId, updatedData);
      if (updatedPoll) {
        setPoll(updatedPoll);
      }
      return updatedPoll;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const vote = (selectedOptions) => {
    try {
      const updatedPoll = addVote(pollId, selectedOptions);
      if (updatedPoll) {
        markUserVoted(pollId);
        setPoll(updatedPoll);
      }
      return updatedPoll;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  return {
    poll,
    loading,
    error,
    updatePoll: updatePollData,
    vote,
    hasVoted: pollId ? hasUserVoted(pollId) : false,
  };
}
