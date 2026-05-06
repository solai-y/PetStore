-- CarePets Sample Data
-- Run this after schema.sql in Supabase SQL Editor.
-- Seed users with password: Password123!

-- Insert auth users first so profile FK constraint is satisfied.
-- Requires pgcrypto extension (enabled by default in Supabase).
INSERT INTO auth.users (
    id, instance_id, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    role, aud,
    confirmation_token, recovery_token, email_change_token_new, email_change
) VALUES
    ('550e8400-e29b-41d4-a716-446655440000', '00000000-0000-0000-0000-000000000000',
     'owner1@example.com', crypt('Password123!', gen_salt('bf')),
     now(), now(), now(), 'authenticated', 'authenticated', '', '', '', ''),
    ('550e8400-e29b-41d4-a716-446655440001', '00000000-0000-0000-0000-000000000000',
     'owner2@example.com', crypt('Password123!', gen_salt('bf')),
     now(), now(), now(), 'authenticated', 'authenticated', '', '', '', ''),
    ('550e8400-e29b-41d4-a716-446655440002', '00000000-0000-0000-0000-000000000000',
     'owner3@example.com', crypt('Password123!', gen_salt('bf')),
     now(), now(), now(), 'authenticated', 'authenticated', '', '', '', ''),
    ('550e8400-e29b-41d4-a716-446655440003', '00000000-0000-0000-0000-000000000000',
     'caretaker1@example.com', crypt('Password123!', gen_salt('bf')),
     now(), now(), now(), 'authenticated', 'authenticated', '', '', '', ''),
    ('550e8400-e29b-41d4-a716-446655440004', '00000000-0000-0000-0000-000000000000',
     'caretaker2@example.com', crypt('Password123!', gen_salt('bf')),
     now(), now(), now(), 'authenticated', 'authenticated', '', '', '', ''),
    ('550e8400-e29b-41d4-a716-446655440005', '00000000-0000-0000-0000-000000000000',
     'caretaker3@example.com', crypt('Password123!', gen_salt('bf')),
     now(), now(), now(), 'authenticated', 'authenticated', '', '', '', ''),
    ('550e8400-e29b-41d4-a716-446655440006', '00000000-0000-0000-0000-000000000000',
     'caretaker4@example.com', crypt('Password123!', gen_salt('bf')),
     now(), now(), now(), 'authenticated', 'authenticated', '', '', '', '')
ON CONFLICT (id) DO NOTHING;

-- Sample user profiles
INSERT INTO profiles (id, role, name, bio, hourly_rate, accepted_pet_types) VALUES
    ('550e8400-e29b-41d4-a716-446655440000', 'owner', 'Sarah Mitchell', NULL, NULL, NULL),
    ('550e8400-e29b-41d4-a716-446655440001', 'owner', 'James Carter', NULL, NULL, NULL),
    ('550e8400-e29b-41d4-a716-446655440002', 'owner', 'Emily Nguyen', NULL, NULL, NULL),
    ('550e8400-e29b-41d4-a716-446655440003', 'caretaker', 'Alice Johnson', 'Experienced dog walker with 5 years experience.', 25.00, ARRAY['dog']),
    ('550e8400-e29b-41d4-a716-446655440004', 'caretaker', 'Bob Smith', 'Cat lover, will pamper your feline friends.', 20.00, ARRAY['cat']),
    ('550e8400-e29b-41d4-a716-446655440005', 'caretaker', 'Carol White', 'All pets welcome! Specialize in small animals.', 30.00, ARRAY['dog', 'cat', 'bird', 'rabbit']),
    ('550e8400-e29b-41d4-a716-446655440006', 'caretaker', 'David Brown', 'Professional pet sitter for dogs and cats.', 28.00, ARRAY['dog', 'cat'])
ON CONFLICT (id) DO NOTHING;

-- Sample pets
INSERT INTO pets (id, owner_id, name, species, breed, age, notes, photo_url) VALUES
    ('660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'Buddy', 'dog', 'Golden Retriever', 3, 'Very friendly, loves walks.', 'https://example.com/buddy.jpg'),
    ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Whiskers', 'cat', 'Siamese', 2, 'Shy but affectionate.', 'https://example.com/whiskers.jpg'),
    ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Max', 'dog', 'Labrador', 5, 'High energy, needs lots of exercise.', 'https://example.com/max.jpg'),
    ('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'Luna', 'cat', 'Persian', 1, 'Young and playful.', 'https://example.com/luna.jpg')
ON CONFLICT (id) DO NOTHING;

-- Sample bookings
INSERT INTO bookings (id, owner_id, pet_id, start_date, end_date, description, budget, status) VALUES
    ('770e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440000', '2024-06-01', '2024-06-03', 'Need someone to walk Buddy twice a day.', 150.00, 'open'),
    ('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440001', '2024-06-05', '2024-06-07', 'Cat sitting for Whiskers while on vacation.', 120.00, 'confirmed'),
    ('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440002', '2024-06-10', '2024-06-12', 'Dog sitting for Max, includes feeding and walks.', 180.00, 'open'),
    ('770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440003', '2024-06-15', '2024-06-16', 'Overnight cat care for Luna.', 80.00, 'cancelled'),
    ('770e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440002', '2024-06-20', '2024-06-22', 'Another trip, need Max cared for.', 200.00, 'open')
ON CONFLICT (id) DO NOTHING;

-- Sample applications
INSERT INTO applications (booking_id, caretaker_id, message, proposed_rate, status) VALUES
    ('770e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440003', 'I love Golden Retrievers! I can walk Buddy.', 25.00, 'pending'),
    ('770e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440005', 'Happy to walk your dog, very experienced.', 30.00, 'pending'),
    ('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440004', 'I will take great care of Whiskers.', 20.00, 'accepted'),
    ('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', 'I can handle Max, lots of energy matches mine!', 28.00, 'pending'),
    ('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440006', 'Professional care for your Labrador.', 32.00, 'pending'),
    ('770e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440005', 'I can take care of Max again.', 30.00, 'pending')
ON CONFLICT DO NOTHING;
