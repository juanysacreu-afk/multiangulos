import { describe, expect, it } from 'bun:test';
import { loginChild, supabase } from '../src/lib/supabase.ts';

describe('Multiángulos 3D - Shared Supabase Auth & DB Isolation', () => {
  it('authenticates existing multibloques user "biel"', async () => {
    const res = await loginChild('biel', '1234');
    expect(res.profile.username).toBe('biel');
    expect(res.profile.id).toBeDefined();
    expect(res.progress).toBeDefined();
    expect(typeof res.progress.stars).toBe('number');
  });

  it('rejects invalid passwords gracefully without crashing', async () => {
    expect(loginChild('biel', 'wrong_pass')).rejects.toThrow();
  });

  it('confirms multibloques_player_stats is isolated and untouched', async () => {
    const { data: stats, error } = await supabase
      .from('multibloques_player_stats')
      .select('user_id, stars')
      .eq('user_id', 'fb5d4b23-6024-44cb-9db2-62640701c7a2') // biel
      .single();

    expect(error).toBeNull();
    expect(stats?.stars).toBe(105); // Biel has 105 stars in multibloques
  });

  it('confirms multiangulos_player_progress has separate progress for biel', async () => {
    const { data: maProgress, error } = await supabase
      .from('multiangulos_player_progress')
      .select('*')
      .eq('user_id', 'fb5d4b23-6024-44cb-9db2-62640701c7a2')
      .single();

    expect(error).toBeNull();
    expect(maProgress?.user_id).toBe('fb5d4b23-6024-44cb-9db2-62640701c7a2');
    expect(maProgress?.world_progress).toBeDefined();
  });
});
