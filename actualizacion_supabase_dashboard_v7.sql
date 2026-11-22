-- GenTest Practica v1.9: centro de control con agregados académicos.
-- Requiere las migraciones anteriores (v1-v6). No modifica ni elimina datos.
BEGIN;
CREATE OR REPLACE FUNCTION public.admin_dashboard_overview()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '' AS $$
DECLARE result jsonb;
BEGIN
 IF NOT public.is_admin() THEN RAISE EXCEPTION 'No autorizado'; END IF;
 WITH student_sessions AS (
  SELECT s.id,s.user_id,s.mode,s.finished_at
  FROM public.test_sessions s JOIN public.profiles p ON p.id=s.user_id
  WHERE p.role <> 'admin'
 ),
 student_answers AS (
  SELECT a.question_id,a.answered_at,a.selected_answer,s.user_id,s.mode,
         q.correct_answer,q.topic,q.question,q.bank_id,b.name AS bank_name
  FROM public.answers a
  JOIN student_sessions s ON s.id=a.session_id
  JOIN public.questions q ON q.id=a.question_id
  JOIN public.banks b ON b.id=q.bank_id
 ),
 weekly AS (
  SELECT count(DISTINCT user_id) AS active_students,
         count(*) AS answers,
         count(*) FILTER (WHERE mode='review') AS reviews
  FROM student_answers WHERE answered_at >= now()-interval '7 days'
 ),
 topic_agg AS (
  SELECT bank_id,bank_name,topic,count(*) AS attempts,
         count(*) FILTER (WHERE selected_answer=correct_answer) AS correct
  FROM student_answers GROUP BY bank_id,bank_name,topic HAVING count(*)>=10
 ),
 weak_topics AS (
  SELECT bank_id,bank_name,topic,attempts,correct,
         round(100.0*correct/nullif(attempts,0),1) AS accuracy
  FROM topic_agg ORDER BY accuracy ASC, attempts DESC LIMIT 5
 ),
 question_agg AS (
  SELECT bank_id,bank_name,topic,question,question_id,count(*) AS attempts,
         count(*) FILTER (WHERE selected_answer<>correct_answer) AS wrong
  FROM student_answers GROUP BY bank_id,bank_name,topic,question,question_id
  HAVING count(*)>=5 AND count(*) FILTER (WHERE selected_answer<>correct_answer)>0
 ),
 hard_questions AS (
  SELECT bank_id,bank_name,topic,question,question_id,attempts,wrong
  FROM question_agg ORDER BY wrong DESC,(wrong::numeric/attempts) DESC,attempts DESC LIMIT 5
 )
 SELECT jsonb_build_object(
  'active_students',(SELECT active_students FROM weekly),
  'completed_tests',(SELECT count(*) FROM student_sessions WHERE finished_at >= now()-interval '7 days' AND finished_at IS NOT NULL),
  'answers',(SELECT answers FROM weekly),
  'reviews',(SELECT reviews FROM weekly),
  'weak_topics',COALESCE((SELECT jsonb_agg(to_jsonb(t) ORDER BY t.accuracy ASC,t.attempts DESC) FROM weak_topics t),'[]'::jsonb),
  'hard_questions',COALESCE((SELECT jsonb_agg(to_jsonb(q) ORDER BY q.wrong DESC,q.attempts DESC) FROM hard_questions q),'[]'::jsonb)
 ) INTO result;
 RETURN result;
END; $$;
REVOKE ALL ON FUNCTION public.admin_dashboard_overview() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_dashboard_overview() TO authenticated;
COMMIT;
