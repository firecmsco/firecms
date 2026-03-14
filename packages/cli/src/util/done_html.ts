export const done_html = `<html lang="en">
<head>
    <style>
        html, body {
            font-family: Rubik, sans-serif;
            height: 100%;
            margin: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }
    </style>
    <link rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Rubik">
</head>

<body>

<img src="https://rebase.pro/img/rebase_logo.svg" alt="Rebase logo" width="100" height="100">

<h2>Rebase CLI</h2>

<p style="margin: 0;">You can now close this tab</p>

<script>

    setTimeout(function () {
        window.close();
    }, 3000);

</script>

</body>
</html>

`;
