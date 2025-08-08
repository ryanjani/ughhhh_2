document.addEventListener('DOMContentLoaded', function() {
    const commentForm = document.getElementById('commentForm');
    const commentText = document.getElementById('commentText');
    const charCount = document.getElementById('charCount');
    const commentsContainer = document.getElementById('commentsContainer');

    // Update character count
    commentText.addEventListener('input', function() {
        const count = this.value.length;
        charCount.textContent = count;
        
        if (count > 450) {
            charCount.className = 'text-red-400 font-bold animate-pulse';
        } else {
            charCount.className = 'text-cyan-400';
        }
    });

    // Handle form submission
    commentForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const text = commentText.value.trim();
        if (!text) return;

        try {
            const response = await fetch('/api/comments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text })
            });

            if (response.ok) {
                commentText.value = '';
                charCount.textContent = '0';
                loadComments();
            } else {
                alert('Error posting comment. Please try again.');
            }
        } catch (error) {
            alert('Error posting comment. Please try again.');
        }
    });

    // Load and display comments
    async function loadComments() {
        try {
            const response = await fetch('/api/comments');
            const comments = await response.json();
            
            if (comments.length === 0) {
                commentsContainer.innerHTML = `
                    <div class="text-center text-yellow-300 py-12 bg-black bg-opacity-50 rounded-2xl">
                        <p class="text-2xl" style="font-family: 'Shrikhand', cursive;">The cosmos awaits your transmission! 🛸</p>
                    </div>
                `;
                return;
            }

            const fonts = ['Lobster', 'Righteous', 'Orbitron', 'Fredoka One', 'Shrikhand'];
            const colors = ['from-purple-600 to-pink-600', 'from-green-500 to-blue-600', 'from-yellow-400 to-red-500', 'from-indigo-600 to-purple-600', 'from-pink-500 to-rose-500'];
            const emojis = ['🪐', '👽', '🛸', '🌙', '⭐', '🌟', '✨', '🌕', '🌖', '🌗'];
            
            commentsContainer.innerHTML = comments.map((comment, index) => {
                const randomFont = fonts[index % fonts.length];
                const randomColor = colors[index % colors.length];
                const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                
                return `
                    <div class="bg-gradient-to-r ${randomColor} p-1 rounded-2xl mb-4 bubble-hover transform hover:rotate-1 hover:scale-105 transition-all duration-300">
                        <div class="bg-black bg-opacity-80 rounded-xl p-6">
                            <div class="flex items-start space-x-3">
                                <span class="text-3xl">${randomEmoji}</span>
                                <div class="flex-1">
                                    <p class="text-white text-lg whitespace-pre-wrap" style="font-family: '${randomFont}', cursive;">${escapeHtml(comment.text)}</p>
                                    <div class="mt-4 text-cyan-300 text-sm font-mono">
                                        ⏰ ${formatTimeAgo(comment.timestamp)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        } catch (error) {
            console.error('Error loading comments:', error);
        }
    }

    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Format timestamp to "time ago" format
    function formatTimeAgo(timestamp) {
        const now = new Date();
        const commentTime = new Date(timestamp);
        const diffMs = now - commentTime;
        const diffMinutes = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMinutes < 1) return 'JUST NOW! 🛸';
        if (diffMinutes < 60) return `${diffMinutes}m ago ⭐`;
        if (diffHours < 24) return `${diffHours}h ago 🌙`;
        if (diffDays < 7) return `${diffDays}d ago 🪐`;
        
        return commentTime.toLocaleDateString();
    }

    // Initial load
    loadComments();
    
    // Refresh comments every 30 seconds
    setInterval(loadComments, 30000);
});