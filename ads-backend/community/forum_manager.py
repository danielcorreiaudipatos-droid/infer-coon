"""Community Forum - Discussion platform for users and agencies"""

import logging
from typing import Dict, List
from datetime import datetime

logger = logging.getLogger(__name__)


class ForumManager:
    """Manage community discussions and knowledge sharing"""

    def __init__(self):
        self.threads = {}
        self.users = {}

    def create_thread(self, author_id: str, title: str, content: str, category: str) -> Dict:
        """Create forum thread"""

        thread_id = f"thr_{datetime.now().timestamp()}"

        thread = {
            "id": thread_id,
            "author_id": author_id,
            "title": title,
            "content": content,
            "category": category,
            "status": "active",
            "views": 0,
            "replies": 0,
            "likes": 0,
            "created_at": datetime.now().isoformat(),
            "is_pinned": False,
            "tags": self._extract_tags(title)
        }

        self.threads[thread_id] = thread
        logger.info(f"Forum thread created: {thread_id}")

        return thread

    def reply_to_thread(self, thread_id: str, user_id: str, content: str) -> Dict:
        """Add reply to thread"""

        if thread_id not in self.threads:
            return {"error": "Thread not found"}

        reply_id = f"rep_{datetime.now().timestamp()}"

        reply = {
            "id": reply_id,
            "thread_id": thread_id,
            "user_id": user_id,
            "content": content,
            "likes": 0,
            "created_at": datetime.now().isoformat()
        }

        self.threads[thread_id]["replies"] += 1

        logger.info(f"Reply added to thread: {thread_id}")
        return reply

    def get_thread(self, thread_id: str) -> Dict:
        """Retrieve thread with replies"""

        if thread_id not in self.threads:
            return {"error": "Thread not found"}

        thread = self.threads[thread_id].copy()
        thread["views"] += 1  # Increment view count

        return thread

    def list_threads(self, category: str = None, sort_by: str = "recent") -> List[Dict]:
        """List threads"""

        threads = list(self.threads.values())

        if category:
            threads = [t for t in threads if t["category"] == category]

        if sort_by == "recent":
            threads.sort(key=lambda x: x["created_at"], reverse=True)
        elif sort_by == "popular":
            threads.sort(key=lambda x: x["views"], reverse=True)
        elif sort_by == "trending":
            threads.sort(key=lambda x: x["likes"], reverse=True)

        return threads

    def create_user_profile(self, user_id: str, username: str, bio: str = "") -> Dict:
        """Create user community profile"""

        profile = {
            "user_id": user_id,
            "username": username,
            "bio": bio,
            "reputation": 0,
            "badges": [],
            "created_at": datetime.now().isoformat(),
            "posts": 0,
            "followers": 0
        }

        self.users[user_id] = profile
        return profile

    def award_badge(self, user_id: str, badge: str) -> Dict:
        """Award gamification badge"""

        if user_id not in self.users:
            return {"error": "User not found"}

        badges = {
            "first_post": "Primeiro Post",
            "helpful_answer": "Resposta Útil",
            "expert": "Especialista",
            "top_contributor": "Principal Contribuidor"
        }

        self.users[user_id]["badges"].append(badges.get(badge, badge))

        return {"user_id": user_id, "badge": badge}

    def get_leaderboard(self, metric: str = "reputation") -> List[Dict]:
        """Get user leaderboard"""

        users = list(self.users.values())
        users.sort(key=lambda x: x.get(metric, 0), reverse=True)

        return users[:10]

    def _extract_tags(self, text: str) -> List[str]:
        """Extract tags from content"""
        # Simple tag extraction: words starting with #
        words = text.split()
        tags = [w[1:] for w in words if w.startswith("#")]
        return tags


def get_forum_manager():
    return ForumManager()
