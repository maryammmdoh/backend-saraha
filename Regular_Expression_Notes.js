/*
Regular expressions are a powerful tool for pattern matching and text manipulation. Here are some common regular expression patterns and their meanings:
    regixs written between / and / are called regular expression literals
        Example: /abc/ is a regular expression literal that matches the string "abc"
    
    g: global search (matches all occurrences of the pattern in the string)
    m: multiline search (treats the start and end of the string as the start and end of each line) , this is useful when you want to match a pattern that can occur at the start or end of a line in a multi-line string
    i: case-insensitive search (matches letters regardless of case)

    \w: matches any word character (alphanumeric or underscore)
        Example: \w matches "a", "Z", "0", "_", but not "!" or " "
    \W: matches any non-word character (anything that is not a letter, digit, or underscore)
        Example: \W matches "!", " ", but not "a", "Z", "0", "_"
    \d: matches any digit character (0-9)
        Example: \d matches "0", "5", but not "a", "Z", "_"
    \D: matches any non-digit character (anything that is not a digit)
        Example: \D matches "a", "Z", "_", but not "0", "5"
    \b: matches a word boundary (the position between a word character and a non-word character)
        Example: \b matches the position between "a" and " " in "a b", but not the position between "a" and "b" in "ab"
    \B: matches a non-word boundary (the position between two word characters or two non-word characters)
        Example: \B matches the position between "a" and "b" in "ab", but not the position between "a" and " " in "a b"
    \s: matches any whitespace character (space, tab, newline)
        Example: \s matches " ", "\t", "\n", but not "a", "Z", "0", "_"
    \S: matches any non-whitespace character (anything that is not a space, tab, or newline)
        Example: \S matches "a", "Z", "0", "_", but not " ", "\t", "\n"
    
    ^: matches the start of a string
        Example: ^ matches the position before "a" in "abc", but not the position before "b" in "abc" or the position before "c" in "abc"
        string: ^a -->  matches "abc", but not "bac" or "cab"
    $: matches the end of a string
        Example: $ matches the position after "c" in "abc", but not the position after "a" in "abc" or the position after "b" in "abc"
        string: c$ --> matches "abc", but not "bac" or "cab"
        string: ^abc$ --> matches "abc", but not "ab" or "abcd"
        string: a$ --> matches "a", "ba", "ca", but not "ab" or "ac"
    *: matches zero or more occurrences of the preceding element
        Example: a* matches "", "a", "aa", "aaa", but not "b"
        string: a* --> matches "", "a", "aa", "aaa", but not "b"
    +: matches one or more occurrences of the preceding element
        Example: a+ matches "a", "aa", "aaa", but not "" or "b"
        string: a+ --> matches "a", "aa", "aaa", but not "" or "b"
    ?: matches zero or one occurrence of the preceding element
        Example: a? matches "", "a", but not "aa" or "b"
        string: a? --> matches "", "a", but not "aa" or "b"
    .: matches any single character except newline
        Example: . matches "a", "Z", "0", "_", "!", " ", but not "\n"
    [abc]: matches any one of the characters a, b, or c
        Example: [abc] matches "a", "b", "c", but not "d" or " "

    [] : like or operator but for characters and it defines a character class that matches any one of the characters inside the square brackets
    [a-z]: matches any lowercase letter from a to z
        Example: [a-z] matches "a", "m", "z", but not "A", "Z", "0", "_"
    [A-Z]: matches any uppercase letter from A to Z
        Example: [A-Z] matches "A", "M", "Z", but not "a", "z", "0", "_"
    [0-9]: matches any digit from 0 to 9    
        Example: [0-9] matches "0", "5", "9", but not "a", "Z", "_"
    [a-zA-Z0-9]: matches any alphanumeric character (lowercase letter, uppercase letter, or digit)
        Example: [a-zA-Z0-9] matches "a", "Z", "0", but not "!", " ", "_"
    [^a-z]: matches any character that is not a lowercase letter from a to z
        Example: [^a-z] matches "A", "Z", "0", "!", " ", "_", but not "a", "m", "z"
    [^A-Z]: matches any character that is not an uppercase letter from A to Z
        Example: [^A-Z] matches "a", "z", "0", "!", " ", "_", but not "A", "M", "Z"
    [^0-9]: matches any character that is not a digit from 0 to 9
        Example: [^0-9] matches "a", "Z", "!", " ", "_", but not "0", "5", "9"
    [^a-zA-Z0-9]: matches any character that is not an alphanumeric character (lowercase letter, uppercase letter, or digit)
        Example: [^a-zA-Z0-9] matches "!", " ", "_", but not "a", "Z", "0"

    {n}: matches exactly n occurrences of the preceding element
        Example: a{3} matches "aaa", but not "aa" or "aaaa"
    {n,}: matches n or more occurrences of the preceding element
        Example: a{3,} matches "aaa", "aaaa", "aaaaa", but not "aa"
    {n,m}: matches between n and m occurrences of the preceding element
        Example: a{3,5} matches "aaa", "aaaa", "aaaaa", but not "aa" or "aaaaaa"


    (): groups multiple tokens together and creates a capture group for extracting a substring or using backreferences
        Example: (abc) matches "abc" and captures it as a group, which can be referenced later in the pattern with \1
    |: acts as a logical OR between multiple patterns
        Example: a|b matches "a" or "b", but not "c"
    Example: (cat|dog) matches "cat" or "dog", but not "catdog"

    Lookahead and lookbehind assertions: these are zero-width assertions that allow you to match a pattern only if it is followed or preceded by another pattern without including that pattern in the match
    Positive lookahead: (?=pattern) matches a pattern only if it is followed by another pattern
        Example: a(?=b) matches "a" only if it is followed by "b", so it matches "ab" but not "ac"
        Example: (?=.*[a-z])(?=.*[A-Z]) --> matches a string that contains at least one lowercase letter and at least one uppercase letter, this is useful for validating password strength
    Negative lookahead: (?!pattern) matches a pattern only if it is not followed by another pattern
        Example: a(?!b) matches "a" only if it is not followed by "b", so it matches "ac" but not "ab"
    Positive lookbehind: (?<=pattern) matches a pattern only if it is preceded by another pattern
        Example: (?<=a)b matches "b" only if it is preceded by "a", so it matches "ab" but not "cb"
    Negative lookbehind: (?<!pattern) matches a pattern only if it is not preceded by another pattern
        Example: (?<!a)b matches "b" only if it is not preceded by "a", so it matches "cb" but not "ab"

    Regex for "First Last" format:
        ^[A-Z]{1}[a-z]{1,24}\s[A-Z]{1}[a-z]{1,24}$ --> matches a string that starts with an uppercase letter followed by 1 to 24 lowercase letters, then a space, then another uppercase letter followed by 1 to 24 lowercase letters, and nothing else before or after
        This is useful for validating names in the "First Last" format where both the first and last names start with an uppercase letter and are followed by lowercase letters, and there is a single space between them.
        Example: "John Doe" matches, but "john doe", "JohnDoe", "John D", "J Doe", "John ", " John Doe" do not match

    Regex for Egyptian phone numbers:
        ^01[0125][0-9]{8}$ --> matches a string that starts with "01", followed by either "0", "1", "2", or "5", and then followed by exactly 8 digits, and nothing else before or after
        ^01(0|1|2|5)\d{8}$
        With +20 or 0020 country code: ^(\+20|0020)?01[0125][0-9]{8}$ --> matches a string that optionally starts with "+20" or "0020", followed by "01", then either "0", "1", "2", or "5", and then followed by exactly 8 digits, and nothing else before or after
        ^(\+20|0020)?01(0|1|2|5)\d{8}$
        ^(\+201|00201|01)(0|1|2|5)\d{8}$
        This is useful for validating Egyptian phone numbers that start with "010", "011", "012", or "015" and are followed by 8 digits, making a total of 11 digits in the phone number.
        Example: "01012345678" matches, but "0123456789", "0111234567", "015123456789", "001012345678" do not match
    
    Regex for email validation:
        ^\w{3,25}@(gmail|yahoo|hotmail|icloud)\.(com|net|org){1,4}$ --> matches a string that starts with one or more alphanumeric characters or dots, underscores, percent signs, plus signs, or hyphens, followed by an "@" symbol, then one or more alphanumeric characters or dots or hyphens, then a dot, and then at least two letters for the domain extension, and nothing else before or after
        This is a common regex pattern for validating email addresses, ensuring that they have a valid format with a local part, an "@" symbol, and a domain part with a valid extension.
        Example: "example@gmail.com" matches, but "example.com", "example@.com", "example@com", "example@com." do not match

    Regex for password validation:
        ^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]){8,16}$ --> matches a string that contains at least one lowercase letter, at least one uppercase letter, at least one digit, at least one special character, and is between 8 and 16 characters long, and nothing else before or after
        This is a common regex pattern for validating password strength, ensuring that the password includes a mix of character types and meets a length requirement.
        Example: "Password1!" matches, but "password", "PASSWORD", "Passw1", "Passw1!", "Password!" do not match

        Another one 
        ^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,16}$ --> matches a string that contains at least one lowercase letter, at least one uppercase letter, at least one digit, at least one special character, and is between 8 and 16 characters long, and nothing else before or after
        Example: "Password1!" matches, but "password", "PASSWORD", "Passw1", "Passw1!", "Password!" do not match

*/