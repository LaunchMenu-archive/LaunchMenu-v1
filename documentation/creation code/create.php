<?php
    error_reporting(E_ERROR | E_PARSE);
    $dir = $_SERVER['DOCUMENT_ROOT'];
    function scan($dir){
        $ar = [];
        try{
            $dirs = scandir($dir);
            for($i=0; $i<count($dirs); $i++){
                $n = $dirs[$i];
                if($n!=".c9" && $n!="." && $n!=".." && strlen($n)>0){
                    if(preg_match("/[.]js/",$n, $matches))
                        array_push($ar, $dir."/".$n);
                    $ar = array_merge($ar, scan($dir."/".$n));
                }
            }
        }catch(Exception $e){}
        return $ar;
    }
    
    $files = scan($_SERVER['DOCUMENT_ROOT']);
    for($i=0; $i<count($files); $i++){
        $files[$i] = file_get_contents($files[$i]);
    }
    echo "<script> files=".json_encode($files)."</script>";
?>
<script type="text/javascript" src="create.js"></script>