import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';

export default function Stories() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const { data } = await api.get('/features/stories');
      setStories(data.stories);
    } catch (err) {
      toast.error('Failed to load stories');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStory = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('media', file);
    formData.append('mediaType', 'image');
    formData.append('caption', '');

    try {
      await api.post('/features/stories', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Story added!');
      fetchStories();
    } catch (err) {
      toast.error('Failed to add story');
    }
  };

  if (loading) {
    return <div className="page"><div className="spinner" /></div>;
  }

  return (
    <div className="page">
      <div className="page-content">
        <h1 style={{ marginBottom: '20px' }}>Stories</h1>
        
        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px' }}>
          <label style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            border: '2px dashed var(--border)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0
          }}>
            <Plus size={24} />
            <span style={{ fontSize: '12px', marginTop: '4px' }}>Add Story</span>
            <input 
              type="file" 
              accept="image/*" 
              style={{ display: 'none' }} 
              onChange={handleAddStory} 
            />
          </label>
          
          {stories.map((story, index) => (
            <div key={index} style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '2px solid var(--primary)',
              flexShrink: 0
            }}>
              <img 
                src={`http://localhost:5000${story.mediaUrl}`} 
                alt="story" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          ))}
        </div>

        {stories.length === 0 && (
          <div className="empty-state" style={{ marginTop: '40px' }}>
            <div className="empty-state-icon">📖</div>
            <h3 className="empty-state-title">No stories yet</h3>
            <p className="empty-state-text">Add the first story!</p>
          </div>
        )}
      </div>
    </div>
  );
}
