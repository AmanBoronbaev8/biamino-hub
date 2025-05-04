
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useProjects } from '../contexts/ProjectContext';
import { Comment } from '../lib/types';
import { Trash, Edit, Send, MessageCircle, Check, X } from 'lucide-react';

interface CommentSectionProps {
  projectId: string;
  comments: Comment[];
}

const EMOJI_OPTIONS = ['👍', '👎', '❤️', '🎉', '😄', '🤔', '👀', '🙌'];

const CommentSection: React.FC<CommentSectionProps> = ({ projectId, comments }) => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { addComment, deleteComment, updateComment, addReaction } = useProjects();
  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    addComment(projectId, newComment);
    setNewComment('');
  };

  const handleEdit = (comment: Comment) => {
    setEditingId(comment.id);
    setEditText(comment.text);
  };

  const handleSaveEdit = () => {
    if (!editingId || !editText.trim()) return;
    
    updateComment(projectId, editingId, editText);
    setEditingId(null);
    setEditText('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleDelete = (commentId: string) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      deleteComment(projectId, commentId);
    }
  };

  const handleReaction = (commentId: string, emoji: string) => {
    addReaction(projectId, commentId, emoji);
    setShowEmojiPicker(null);
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <MessageCircle className="mr-2" size={20} />
        Comments
      </h2>

      {comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map(comment => (
            <div 
              key={comment.id} 
              className="p-4 border rounded-lg bg-card"
            >
              {editingId === comment.id ? (
                <div className="space-y-3">
                  <textarea
                    value={editText}
                    onChange={e => setEditText(e.target.value)}
                    className="biamino-input resize-none w-full h-24"
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={handleCancelEdit}
                      className="biamino-btn-outline"
                    >
                      <X size={16} className="mr-1" />
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      className="biamino-btn-primary"
                    >
                      <Check size={16} className="mr-1" />
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between">
                    <div className="flex items-center mb-2">
                      <div className="font-medium">{comment.username}</div>
                      <span className="mx-2 text-muted-foreground">•</span>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(comment.createdAt)}
                      </div>
                    </div>
                    
                    {(isAdmin || (user && user.id === comment.userId)) && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(comment)}
                          className="text-muted-foreground hover:text-foreground"
                          title="Edit comment"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(comment.id)}
                          className="text-muted-foreground hover:text-destructive"
                          title="Delete comment"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-1 mb-3 whitespace-pre-wrap">{comment.text}</div>
                  
                  <div className="flex flex-wrap gap-2">
                    {comment.reactions && Object.entries(comment.reactions).map(([emoji, count]) => (
                      <button
                        key={emoji}
                        onClick={() => handleReaction(comment.id, emoji)}
                        className="inline-flex items-center px-2 py-1 rounded-full bg-muted text-sm"
                      >
                        <span className="mr-1">{emoji}</span>
                        <span>{count}</span>
                      </button>
                    ))}
                    
                    {isAuthenticated && (
                      <div className="relative">
                        <button
                          onClick={() => setShowEmojiPicker(showEmojiPicker === comment.id ? null : comment.id)}
                          className="inline-flex items-center px-2 py-1 rounded-full bg-muted text-sm hover:bg-accent"
                        >
                          +
                        </button>
                        
                        {showEmojiPicker === comment.id && (
                          <div className="absolute bottom-full mb-2 left-0 p-2 bg-popover shadow-md rounded-md border z-10 flex space-x-1">
                            {EMOJI_OPTIONS.map(emoji => (
                              <button
                                key={emoji}
                                onClick={() => handleReaction(comment.id, emoji)}
                                className="w-8 h-8 flex items-center justify-center hover:bg-muted rounded"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-center py-8">
          No comments yet. Be the first to leave a comment!
        </p>
      )}

      {isAuthenticated && (
        <form onSubmit={handleSubmit} className="mt-6">
          <div className="flex flex-col space-y-3">
            <textarea
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="biamino-input resize-none h-24"
              required
            />
            <div className="flex justify-end">
              <button type="submit" className="biamino-btn-primary">
                <Send size={16} className="mr-2" />
                Post Comment
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default CommentSection;
