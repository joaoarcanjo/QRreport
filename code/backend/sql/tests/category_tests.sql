/*
 * Script to test all the implemented categories functionalities
 */

/*
 * Tests the category representation function
 */
DO
$$
DECLARE
    category_id BIGINT = 1;
    category_name TEXT = 'Building name test';
    category_state TEXT = 'Active';
    category_timestamp TIMESTAMP;
    category_rep JSON;
BEGIN
    RAISE INFO '---| Category item representation test |---';

    category_timestamp = CURRENT_TIMESTAMP;
    category_rep = category_item_representation(category_id, category_name, category_state, category_timestamp);
    IF (
        assert_json_value(category_rep, 'id', category_id::TEXT) AND
        assert_json_value(category_rep, 'name', category_name) AND
        assert_json_value(category_rep, 'state', category_state) AND
        assert_json_is_not_null(category_rep, 'timestamp')
    ) THEN
        RAISE INFO '-> Test succeeded!';
    ELSE
        RAISE EXCEPTION '-> Test failed!';
    END IF;
END$$;

/*
 * Tests get categories function
 */
DO
$$
DECLARE
    categories_rep JSON;
    expected_collection_size INT = 9;
BEGIN
    RAISE INFO '---| Get categories function test |---';

    categories_rep = get_categories(50, 0);
    IF (
        assert_json_is_not_null(categories_rep, 'categories') AND
        assert_json_value(categories_rep, 'categoriesCollectionSize', expected_collection_size::TEXT)
    ) THEN
        RAISE INFO '-> Test succeeded!';
    ELSE
        RAISE EXCEPTION '-> Test failed!';
    END IF;
END$$;

/*
 * Tests creation of a new category
 */
DO
$$
DECLARE
    id BIGINT;
    category_name TEXT = 'Category name test';
    category_state TEXT = 'Active';
    category_rep JSON;
BEGIN
    RAISE INFO '---| Category creation test |---';

    CALL create_category(category_name, category_rep);
    id = category_rep->>'id';
    IF (
        assert_json_is_not_null(category_rep, 'id') AND
        assert_json_value(category_rep, 'name', category_name) AND
        assert_json_value(category_rep, 'state', category_state) AND
       assert_json_is_not_null(category_rep, 'timestamp')
    ) THEN
        RAISE INFO '-> Test succeeded!';
    ELSE
        RAISE EXCEPTION '-> Test failed!';
    END IF;
    ROLLBACK;

    -- Remove sequence inc
   IF (id = 1) THEN
        ALTER SEQUENCE category_id_seq RESTART;
        RETURN;
    END IF;
    PERFORM setval('category_id_seq', (SELECT last_value FROM category_id_seq) - 1);
END$$;

/*
 * Tests update the name of a category
 */
DO
$$
DECLARE
    category_id BIGINT = 9;
    category_name TEXT = 'Category name test';
    category_rep JSON;
BEGIN
    RAISE INFO '---| Category update test |---';

    CALL update_category(category_id, category_name, category_rep);
    IF (
        assert_json_value(category_rep, 'name', category_name)
    ) THEN
        RAISE INFO '-> Test succeeded!';
    ELSE
        RAISE EXCEPTION '-> Test failed!';
    END IF;
    ROLLBACK;
END$$;


/*
 * Tests update the name of a category, throws category_in_use exception
 */
DO
$$
DECLARE
    category_id BIGINT = 1;
    category_name TEXT = 'Category name test';
    category_rep JSON;
    ex_constraint TEXT;
BEGIN
    RAISE INFO '---| Update category, throws category_in_use |---';

    CALL update_category(category_id, category_name, category_rep);
    RAISE EXCEPTION '-> Test failed!';
EXCEPTION
    WHEN raise_exception THEN
        GET STACKED DIAGNOSTICS ex_constraint = MESSAGE_TEXT;
        IF (ex_constraint = 'category_in_use') THEN
            RAISE INFO '-> Test succeeded!';
        ELSE
            RAISE EXCEPTION '-> Test failed!';
        END IF;
END$$;

/*
 * Tests the category deactivation
 */
DO
$$
DECLARE
    category_id BIGINT = 8;
    state TEXT = 'Inactive';
    category_rep JSON;
BEGIN
    RAISE INFO '---| Category deactivation test |---';

    CALL deactivate_category(category_id, category_rep);
    RAISE INFO '%', category_rep;
    IF (
        assert_json_value(category_rep, 'state', state)
    ) THEN
        RAISE INFO '-> Test succeeded!';
    ELSE
        RAISE EXCEPTION '-> Test failed!';
    END IF;
    ROLLBACK;
END$$;

/*
 * Tests the category deactivation, throws category_in_use exception
 */
DO
$$
DECLARE
    category_id BIGINT = 1;
    category_rep JSON;
    ex_constraint TEXT;
BEGIN
    RAISE INFO '---| Category deactivation, throws category_in_use |---';

    CALL deactivate_category(category_id, category_rep);
    RAISE EXCEPTION '-> Test failed!';
EXCEPTION
    WHEN raise_exception THEN
        GET STACKED DIAGNOSTICS ex_constraint = MESSAGE_TEXT;
        IF (ex_constraint = 'category_in_use') THEN
            RAISE INFO '-> Test succeeded!';
        ELSE
            RAISE EXCEPTION '-> Test failed!';
        END IF;
END$$;

/*
 * Tests the category activation
 */
DO
$$
DECLARE
    category_id BIGINT = 9;
    state TEXT = 'Active';
    category_rep JSON;
BEGIN
    RAISE INFO '---| Category activation test |---';

    CALL activate_category(category_id, category_rep);
    IF (
        assert_json_value(category_rep, 'state', state)
    ) THEN
        RAISE INFO '-> Test succeeded!';
    ELSE
        RAISE EXCEPTION '-> Test failed!';
    END IF;
    ROLLBACK;
END$$;