import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// 티어별 기본 점수
const TIER_BASE: Record<string, number> = { 
  'IRON': 20, 'BRONZE': 34, 'SILVER': 48, 'GOLD': 62, 'PLATINUM': 76, 'EMERALD': 90, 'DIAMOND': 104, 'MASTER': 118, 'GRANDMASTER': 132, 'CHALLENGER': 146
};

// 라이엇 API는 로마자(I, II, III, IV)를 사용하므로 키값을 수정해야 합니다.
const RANK_BONUS: Record<string, number> = { 'I': 6, 'II': 4, 'III': 2, 'IV': 0 };

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { riotIds } = await req.json(); 
    const RIOT_KEY = Deno.env.get('RIOT_API_KEY');

    if (!RIOT_KEY) throw new Error("RIOT_API_KEY is not set");

    let highestScore = 0;
    let highestTierName = "UNRANKED";
    let totalGames = 0;

    for (const fullId of riotIds) {
      const lastHashIndex = fullId.lastIndexOf('#');
      if (lastHashIndex === -1) continue;

      const name = fullId.substring(0, lastHashIndex);
      const tag = fullId.substring(lastHashIndex + 1);
      
      console.log(`조회 시작: ${name}#${tag}`);

      // 1. Account V1 (ASIA) - PUUID 가져오기
      const accRes = await fetch(`https://asia.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(name)}/${encodeURIComponent(tag)}?api_key=${RIOT_KEY}`);
      if (!accRes.ok) continue;
      const accData = await accRes.json();

      // 2. League V4 (KR) - 랭크 정보 가져오기 (PUUID 방식을 사용하여 단계 축소 및 오류 방지)
      // 주의: league/v1 -> league/v4 로 수정, by-summoner 대신 by-puuid 사용
      const leaRes = await fetch(`https://kr.api.riotgames.com/lol/league/v4/entries/by-puuid/${accData.puuid}?api_key=${RIOT_KEY}`);
      if (!leaRes.ok) {
        console.error(`리그 정보 조회 실패: ${leaRes.status}`);
        continue;
      }
      const leaData = await leaRes.json();

      // 3. 솔로 랭크 데이터 찾기
      const soloRank = leaData.find((e: any) => e.queueType === "RANKED_SOLO_5x5");
      
      if (soloRank) {
        const currentTierPoints = (TIER_BASE[soloRank.tier] || 0) + (RANK_BONUS[soloRank.rank] || 0);
        
        if (currentTierPoints > highestScore) {
          highestScore = currentTierPoints;
          highestTierName = `${soloRank.tier} ${soloRank.rank}`;
        }
        totalGames += (soloRank.wins + soloRank.losses);
      }
    }

    // 판수 감점 로직
    const deduction = Math.min(Math.floor(totalGames / 50), 10);
    const finalScore = highestScore > 0 ? Math.max(0, highestScore - deduction) : 0;

    return new Response(
      JSON.stringify({ 
        highestTier: highestTierName, 
        tierScore: highestScore,
        totalGames: totalGames, 
        deduction: deduction,
        finalScore: finalScore 
      }), 
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      headers: { ...corsHeaders, "Content-Type": "application/json" }, 
      status: 500 
    });
  }
})