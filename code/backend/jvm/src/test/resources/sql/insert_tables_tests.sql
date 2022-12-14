BEGIN;
    INSERT INTO CATEGORY(name,state) VALUES
        ('water', 'active'),
        ('electricity', 'active'),
        ('garden', 'inactive'),
        ('window', 'active'); -- Not being used

    INSERT INTO ROLE(name) VALUES
        ('guest'),
        ('user'),
        ('employee'),
        ('manager'),
        ('admin');

    INSERT INTO COMPANY(name, state) VALUES
        ('ISEL', 'active'), -- 2 buildings
        ('IST', 'active'), -- 0 buildings
        ('IPMA', 'inactive'); -- 0 buildings

    INSERT INTO PERSON(id, name, phone, email, password, state, active_role) VALUES
        ('4b341de0-65c0-4526-8898-24de463fc315','Diogo Novo', '961111111', 'diogo@qrreport.com', '$2a$10$4IeU1oTfxXRQFBVaUrSy9.xqxPLkT.dOFGVa9.VwmNF6WLDlQa04y', 'active', 5),--admin --diogopass
        ('1f6c1014-b029-4a75-b78c-ba09c8ea474d','João Arcanjo', null, 'joni@isel.com', '$2a$10$FnfoD5NC8GRsZKBEH3pC5.Li3SYUOG1EyqAyiiSLJnnd2YHInWc..', 'active', 5),            --admin --joaopass
        ('d1ad1c02-9e4f-476e-8840-c56ae8aa7057','Pedro Miguens', '963333333', 'pedro@isel.com', '$2a$10$xWfdwoxJBzp8J5M44GQ0veUBvJG3yacGdPGPXFgKKhoRaNhCMN6lG', 'active', 4), --manager --pedropass
        ('c2b393be-d720-4494-874d-43765f5116cb','Zé Manuel', '965555555', 'zeze@fixings.com', '$2a$10$DlrjEOpJUig4AqVV2yN2R.fSnSOmZwquBQuZi1cHLZStQMhpQjlmC', 'active', 3),      -- employee --zepass
        ('b555b6fc-b904-4bd9-8c2b-4895738a437c','Francisco Ludovico', '9653456345', 'ludviks@gmail.com', '$2a$10$f8zP0VKF42DLtF3qNlBnn.fv3QxNXjYrfa6iuTtcRwYJpTnCN9/i6', 'active', 2),-- user --franciscopass
        ('b9063a7e-7ba4-42d3-99f4-1b00e00db55d','Daniela Gomes', null, 'dani@isel.com', '$2a$10$mNL.45WNpF1W64J.RYKLYelmvmxIfAA7iTiOPQtfhEu7t4W62MKRy', 'active', 1);       --guest --danielapass

    INSERT INTO PERSON(id, name, phone, email, password, state, active_role, reason, banned_by) VALUES
        ('5e63ea2f-53cf-4546-af41-f0b3a20eac91','António Ricardo', null, 'antonio@isel.com', '$2a$10$mNL.45WNpF1W64J.RYKLYelmvmxIfAA7iTiOPQtfhEu7t4W62MKRy', 'banned', 1, 'Bad behaviour', '4b341de0-65c0-4526-8898-24de463fc315'); --manager --danielapass

    INSERT INTO PERSON_ROLE(person, role) VALUES
        ('4b341de0-65c0-4526-8898-24de463fc315', 5), -- Diogo Novo / admin
        ('4b341de0-65c0-4526-8898-24de463fc315', 4), -- Diogo Novo / manager
        ('1f6c1014-b029-4a75-b78c-ba09c8ea474d', 5), -- João Arcanjo / admin
        ('d1ad1c02-9e4f-476e-8840-c56ae8aa7057', 4), -- Pedro Miguens / manager
        ('c2b393be-d720-4494-874d-43765f5116cb', 3), -- Zé Manuel / employee
        ('b555b6fc-b904-4bd9-8c2b-4895738a437c', 2), -- Francisco Ludovico / user
        ('b9063a7e-7ba4-42d3-99f4-1b00e00db55d', 1), -- Daniela Gomes / guest
        ('5e63ea2f-53cf-4546-af41-f0b3a20eac91', 4);  --António Ricardo / manager


    INSERT INTO PERSON_SKILL (person, category) VALUES
        ('c2b393be-d720-4494-874d-43765f5116cb', 1), -- Zé Manuel / water
        ('c2b393be-d720-4494-874d-43765f5116cb', 2); -- Zé Manuel / electricity

    INSERT INTO PERSON_COMPANY (person, company, state) VALUES
        ('4b341de0-65c0-4526-8898-24de463fc315', 1, 'active'), -- Diogo Novo(manager), ISEL
        ('d1ad1c02-9e4f-476e-8840-c56ae8aa7057', 1, 'active'), -- Pedro Miguens(manager), ISEL
        ('c2b393be-d720-4494-874d-43765f5116cb', 1, 'active'), -- Zé Manuel(employee), ISEL
        ('d1ad1c02-9e4f-476e-8840-c56ae8aa7057', 2, 'inactive'); -- Pedro Miguens(manager), IST

    INSERT INTO BUILDING(name, floors, state, company, manager) VALUES
        ('A', 4, 'active', 1, '4b341de0-65c0-4526-8898-24de463fc315'), -- Diogo Novo, ISEL
        ('F', 6, 'active', 1, 'd1ad1c02-9e4f-476e-8840-c56ae8aa7057'), -- Pedro Miguens, ISEL
        ('Z', 6, 'inactive', 1, 'd1ad1c02-9e4f-476e-8840-c56ae8aa7057'); -- Pedro Miguens, ISEL

    INSERT INTO ROOM(name, floor, state, building) VALUES
        ('1 - Bathroom', 1, 'active', 1),
        ('2', 1, 'active', 1),
        ('1', 1, 'active', 2),
        ('57', 3, 'inactive', 2);

    INSERT INTO DEVICE(name, state, category) VALUES
        ('Toilet1', 'active', 1),
        ('Lights', 'active', 2),
        ('Faucet', 'inactive', 1);

    INSERT INTO ANOMALY(device, anomaly) VALUES
        (1, 'The flush doesn''t work'),
        (1, 'The water is overflowing'),
        (1, 'The toilet is clogged'),
        (1, 'The water is always running');

    INSERT INTO ROOM_DEVICE (room, device, qr_hash) VALUES
        (1, 1, '5abd4089b7921fd6af09d1cc1cbe5220'); -- (ISEL) 1 - Bathroom, Toilet1

    INSERT INTO USER_STATE (name) VALUES
        ('Waiting analysis'),
        ('Refused'),
        ('Not started'),
        ('Fixing'),
        ('Completed'),
        ('Archived');

    INSERT INTO EMPLOYEE_STATE (name, user_state) VALUES
        ('To assign', 1),
        ('Refused', 2),
        ('Not started', 3),
        ('Fixing', 4),
        ('Waiting for material', 4),
        ('Completed', 5),
        ('Archived', 6);

    INSERT INTO EMPLOYEE_STATE_TRANS (first_employee_state, second_employee_state) VALUES
        (1, 2),  -- To assign -> Refused
        (3, 4),  -- Not started -> Fixing
        (4, 6),  -- Fixing -> Completed
        (6, 7);  -- Completed -> Archived

    INSERT INTO TICKET (subject, description, room, device, reporter, employee_state) VALUES
        ('Fuga de água', 'A sanita está a deixar sair água por baixo', 1, 1, 'b555b6fc-b904-4bd9-8c2b-4895738a437c', 4),
        ('Infiltração na parede', 'Os cães começaram a roer a corda e acabaram por fugir todos, foi assustador', 1, 1, 'b555b6fc-b904-4bd9-8c2b-4895738a437c', 1),
        ('Archived ticket', 'Archived ticket description', 1, 1, 'b555b6fc-b904-4bd9-8c2b-4895738a437c', 7);

    INSERT INTO FIXING_BY (person, ticket, start_timestamp) VALUES
        ('c2b393be-d720-4494-874d-43765f5116cb', 1, '2022-07-27 10:50:23.425072'); -- Zé Manuel | Fuga de água

    INSERT INTO COMMENT (comment, person, ticket, timestamp) VALUES
        ('Esta sanita não tem arranjo, vou precisar de uma nova.', 'c2b393be-d720-4494-874d-43765f5116cb', 1, '2022-07-27 09:54:36.425072'),
        ('Tente fazer o possível para estancar a fuga.', '4b341de0-65c0-4526-8898-24de463fc315', 1, '2022-07-26 09:54:36.425072');
COMMIT;
