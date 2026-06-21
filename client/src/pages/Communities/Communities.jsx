import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export default function Communities() {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      const { data } = await api.get('/features/communities');
      setCommunities(data.communities);
    } catch (err) {
      toast.error('Failed to load communities');
    } finally {
      setLoading(false);
    }
  };

  const toggleJoin = async (communityId, isMember) => {
    try {
      if (isMember) {
        await api.post(`/features/communities/${communityId}/leave`);
      } else {
        await api.post(`/features/communities/${communityId}/join`);
      }
      fetchCommunities();
    } catch (err) {
      toast.error('Failed to update membership');
    }
  };

  if (loading) {
    return <div className="page"><div className="spinner" /></div>;
  }

  return (
    <div className="page">
      <div className="page-content">
        <h1 style={{ marginBottom: '20px' }}>Communities</h1>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {communities.map((community) => {
            const isMember = community.members?.includes(user._id);
            return (
              <div 
                key={community._id} 
                style={{
                  background: 'var(--bg-elevated)',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ fontSize: '32px' }}>{community.icon}</div>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '16px' }}>{community.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {community.members?.length || 0} members
                    </div>
                  </div>
                </div>
                <button 
                  className={`btn ${isMember ? 'btn-secondary' : 'btn-primary'} btn-sm`}
                  onClick={() => toggleJoin(community._id, isMember)}
                >
                  {isMember ? 'Leave' : 'Join'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
