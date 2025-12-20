-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.Answers (
  game_id uuid NOT NULL,
  team_id uuid NOT NULL,
  round_number bigint NOT NULL,
  question_number bigint NOT NULL,
  answer text NOT NULL,
  question_id uuid NOT NULL,
  CONSTRAINT Answers_pkey PRIMARY KEY (game_id, team_id, round_number, question_number),
  CONSTRAINT Answers_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.Questions(id),
  CONSTRAINT TeamAnswers_game_id_fkey FOREIGN KEY (game_id) REFERENCES public.Games(id),
  CONSTRAINT TeamAnswers_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.Teams(id)
);
CREATE TABLE public.DeckRounds (
  deck_id uuid NOT NULL,
  round_number bigint NOT NULL,
  num_questions bigint NOT NULL,
  categories ARRAY,
  attributes ARRAY,
  round_id uuid NOT NULL DEFAULT gen_random_uuid(),
  CONSTRAINT DeckRounds_pkey PRIMARY KEY (round_id),
  CONSTRAINT DeckRounds_deck_id_fkey FOREIGN KEY (deck_id) REFERENCES public.Decks(id)
);
CREATE TABLE public.Decks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  owner_id uuid NOT NULL,
  CONSTRAINT Decks_pkey PRIMARY KEY (id),
  CONSTRAINT Decks_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.Users(id)
);
CREATE TABLE public.GamePlayers (
  game_id uuid NOT NULL,
  player_id uuid NOT NULL,
  team_id uuid NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  CONSTRAINT GamePlayers_pkey PRIMARY KEY (game_id, player_id),
  CONSTRAINT GamePlayers_game_id_fkey FOREIGN KEY (game_id) REFERENCES public.Games(id),
  CONSTRAINT GamePlayers_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.Users(id),
  CONSTRAINT GamePlayers_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.Teams(id)
);
CREATE TABLE public.Games (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  deck_id uuid NOT NULL,
  host_id uuid NOT NULL,
  start_time timestamp with time zone NOT NULL,
  end_time timestamp with time zone,
  join_code text NOT NULL,
  status text NOT NULL DEFAULT 'open'::text,
  current_round bigint NOT NULL DEFAULT '1'::bigint,
  current_question bigint NOT NULL DEFAULT '1'::bigint,
  question_time_sec bigint NOT NULL DEFAULT '20'::bigint,
  last_question_start timestamp with time zone,
  CONSTRAINT Games_pkey PRIMARY KEY (id),
  CONSTRAINT Games_deck_id_fkey FOREIGN KEY (deck_id) REFERENCES public.Decks(id),
  CONSTRAINT Games_deck_id_fkey1 FOREIGN KEY (deck_id) REFERENCES public.Decks(id),
  CONSTRAINT Games_host_id_fkey FOREIGN KEY (host_id) REFERENCES public.Users(id),
  CONSTRAINT Games_host_id_fkey1 FOREIGN KEY (host_id) REFERENCES public.Users(id)
);
CREATE TABLE public.QuestionAttributes (
  question_id uuid NOT NULL DEFAULT gen_random_uuid(),
  attribute text NOT NULL,
  CONSTRAINT QuestionAttributes_pkey PRIMARY KEY (question_id, attribute),
  CONSTRAINT QuestionAttributes_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.Questions(id)
);
CREATE TABLE public.Questions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  question text NOT NULL,
  difficulty smallint NOT NULL,
  a text NOT NULL,
  b text NOT NULL,
  c text,
  d text,
  category text NOT NULL,
  first_answer bigint NOT NULL DEFAULT '1'::bigint,
  review_status integer NOT NULL DEFAULT 1,
  created_by uuid,
  is_private boolean NOT NULL DEFAULT false,
  CONSTRAINT Questions_pkey PRIMARY KEY (id),
  CONSTRAINT Questions_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.Users(id)
);
CREATE TABLE public.RoundQuestions (
  question_id uuid NOT NULL,
  question_number bigint NOT NULL,
  round_id uuid NOT NULL,
  CONSTRAINT RoundQuestions_pkey PRIMARY KEY (question_id, round_id),
  CONSTRAINT RoundQuestions_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.Questions(id),
  CONSTRAINT RoundQuestions_round_id_fkey FOREIGN KEY (round_id) REFERENCES public.DeckRounds(round_id)
);
CREATE TABLE public.Scores (
  team_id uuid NOT NULL DEFAULT gen_random_uuid(),
  game_id uuid NOT NULL DEFAULT gen_random_uuid(),
  score bigint NOT NULL,
  CONSTRAINT Scores_pkey PRIMARY KEY (team_id, game_id),
  CONSTRAINT Scores_game_id_fkey FOREIGN KEY (game_id) REFERENCES public.Games(id),
  CONSTRAINT Scores_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.Teams(id)
);
CREATE TABLE public.TeamMembers (
  team_id uuid NOT NULL,
  user_id uuid NOT NULL,
  CONSTRAINT TeamMembers_pkey PRIMARY KEY (team_id, user_id),
  CONSTRAINT TeamMembers_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.Teams(id),
  CONSTRAINT TeamMembers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.Users(id)
);
CREATE TABLE public.Teams (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  CONSTRAINT Teams_pkey PRIMARY KEY (id)
);
CREATE TABLE public.UserDecks (
  user_id uuid NOT NULL,
  deck_id uuid NOT NULL,
  CONSTRAINT UserDecks_pkey PRIMARY KEY (user_id, deck_id),
  CONSTRAINT HostDecks_deck_id_fkey FOREIGN KEY (deck_id) REFERENCES public.Decks(id),
  CONSTRAINT UserDecks_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.Users(id)
);
CREATE TABLE public.Users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_name text NOT NULL,
  hashed_password text NOT NULL,
  is_admin boolean NOT NULL DEFAULT false,
  CONSTRAINT Users_pkey PRIMARY KEY (id)
);