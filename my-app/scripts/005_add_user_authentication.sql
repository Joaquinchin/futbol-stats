-- =====================================================
-- Script: Add User Authentication and RLS
-- Descripción: Agrega user_id a todas las tablas y 
--              configura Row Level Security para 
--              que cada usuario solo vea sus datos
-- =====================================================

-- 1. Agregar columna user_id a la tabla matches
ALTER TABLE matches 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Crear índice para mejorar performance
CREATE INDEX IF NOT EXISTS idx_matches_user_id ON matches(user_id);

-- 2. Agregar columna user_id a la tabla teams
ALTER TABLE teams 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_teams_user_id ON teams(user_id);

-- 3. Agregar columna user_id a la tabla tournaments
ALTER TABLE tournaments 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_tournaments_user_id ON tournaments(user_id);

-- =====================================================
-- 4. ELIMINAR políticas antiguas (públicas)
-- =====================================================

-- Matches
DROP POLICY IF EXISTS "Allow all operations" ON matches;

-- Teams
DROP POLICY IF EXISTS "Allow all operations on teams" ON teams;

-- Tournaments
DROP POLICY IF EXISTS "Allow all operations on tournaments" ON tournaments;

-- =====================================================
-- 5. CREAR nuevas políticas RLS por usuario
-- =====================================================

-- MATCHES: Cada usuario solo ve/edita sus propios partidos
CREATE POLICY "Users can view their own matches"
  ON matches FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own matches"
  ON matches FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own matches"
  ON matches FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own matches"
  ON matches FOR DELETE
  USING (auth.uid() = user_id);

-- TEAMS: Cada usuario solo ve/edita sus propios equipos
CREATE POLICY "Users can view their own teams"
  ON teams FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own teams"
  ON teams FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own teams"
  ON teams FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own teams"
  ON teams FOR DELETE
  USING (auth.uid() = user_id);

-- TOURNAMENTS: Cada usuario solo ve/edita sus propios torneos
CREATE POLICY "Users can view their own tournaments"
  ON tournaments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tournaments"
  ON tournaments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tournaments"
  ON tournaments FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tournaments"
  ON tournaments FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- NOTA IMPORTANTE:
-- =====================================================
-- Este script NO migrará datos existentes porque
-- no hay usuarios todavía. Si tienes datos de prueba,
-- se perderán al ejecutar este script.
-- 
-- Después de ejecutar este script:
-- 1. Habilita Email Auth en Supabase Dashboard
-- 2. Implementa el login/registro en la app
-- 3. Los nuevos registros automáticamente tendrán user_id
-- =====================================================

