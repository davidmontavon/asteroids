<?php
header("Content-Type: application/json");

function sanitize($str)
{
    $str = trim($str);
    $str = filter_var($str, FILTER_SANITIZE_STRING);
    if (strlen($str) > 10)
        $str = substr($str, 0, 10);
    return $str;
}

if (isset($_GET["action"]))
{
    $action = $_GET["action"];

    switch($action)
    {
        case "getTopScores":
            try
            {
                $strTopScores = file_get_contents("top_scores.txt");
                $lines = explode("\n", $strTopScores);
                $jsonScores = array();

                foreach ($lines as $line)
                {
                    if (strpos($line, ';') == false)
                        continue;  

                    $fields = explode(";", $line);
                    $name = sanitize($fields[0]);
                    $score = sanitize($fields[1]);

                    if (strlen($name) == 0 || strlen($score) == 0 || !is_numeric($score))
                        continue;

                    array_push($jsonScores, "{ \"name\": \"" . $name . "\", \"score\": " . $score . " }");
                }
                echo "[" . implode(",", $jsonScores) . "]";
            }
            catch(Exception $e)
            {
                echo "[]";
            }
            break;

        case "saveTopScores":
            try
            {
                if (isset($_POST["topScores"]) && strlen($_POST["topScores"]) < 1000)
                {
                    $jsonTopScores = json_decode($_POST["topScores"]);
                    $fw = fopen("top_scores.txt", "w+");

                    foreach ($jsonTopScores as $jsonTopScore)
                    {
                        $name = sanitize($jsonTopScore->name);
                        $score = sanitize($jsonTopScore->score);
                        if (strlen($name) > 0 && strlen($score) > 0 && is_numeric($score))
                            fwrite($fw, $name . ";" . $score . "\n");
                    }

                    fclose($fw);
                    echo "{\"success\": true}";
                }
            }
            catch (Exception $e)
            {
                echo "{\"success\": false}";
            }
            break;
    }
}
?>