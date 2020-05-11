<?php
header("Content-Type: application/json");

function sanitize($str)
{
    $str = str_replace("<", "", $str);
    $str = str_replace(">", "", $str);
    $str = str_replace("\"", "", $str);
    if (strlen($str) > 10)
    {
        $str = substr($str, 0, 10);
    }
    return $str;
}

if (isset($_GET["action"]))
{
    $action = $_GET["action"];

    switch($action)
    {
        case "getTopScores":
            $strTopScores = file_get_contents("top_scores.txt");
            $lines = explode("\n", $strTopScores);
            $jsonScores = array();
            foreach ($lines as $line)
            {
                if (strpos($line, ';') !== false)
                {
                    $fields = explode(";", $line);
                    array_push($jsonScores, "{ \"name\": \"" . $fields[0] . "\", \"score\": " . $fields[1] . " }");
                }
            }
            echo "[" . implode(",", $jsonScores) . "]";
            break;

        case "saveTopScores":
            if (isset($_POST["topScores"]) && strlen($_POST["topScores"]) < 1000)
            {
                $jsonTopScores = json_decode($_POST["topScores"]);
                $fw = fopen("top_scores.txt", "w+");
                foreach ($jsonTopScores as $jsonTopScore)
                {
                    fwrite($fw, sanitize($jsonTopScore->name) . ";" . $jsonTopScore->score . "\n");
                }
                fclose($fw);
                echo "{\"success\": true}";
            }
            break;
    }
}
?>