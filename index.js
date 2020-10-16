var spell = (word, host) => {
    var letterPaths = word
        .split("")
        .map((l) => {
            if (l == " ") return "audio/space.wav";
            var n = l.toLowerCase();
            if (host == "quip") n = "".concat(l.toUpperCase(), Math.floor(Math.random() * 3) + 1);
            return "".concat("audio/", host, "/", n, ".wav");
        });
    console.log(letterPaths);
    var audio = new Crunker();
    audio
        .fetchAudio(...letterPaths)
        .then((buffers) => {
            return audio.concatAudio(buffers);
        })
        .then((merged) => {
            return audio.export(merged, "audio/mp3");
        })
        .then((output) => {
            Swal.close();
            new Howl({
                src: [output.url],
                format: ["mp3"],
                autoplay: true
            });
            audio.download(output.blob, "".concat(host, "_", word.replace(/ /g, "_")));
        })
        .catch((error) => {
            console.log(error);
        });
};

$(() => {
    var hosts = [
        { name: "Quiplash 3 (Schmitty)", id: "quip" },
        { name: "The Devils and the Details", id: "devils" },
        { name: "Champ'd Up", id: "champd" },
        { name: "Talking Points", id: "talks" },
        { name: "Blather 'Round", id: "blather" }
    ];
    hosts.forEach((h) => {
        $(".host-select").append(
            $("<option/>").attr({ value: h.id }).html(h.name)
        );
    });
    $(".submit").on("click", () => {
        var val = $(".word-input").val().trim().toUpperCase().replace(/[^A-Z ]/g, "").substring(0, 40);
        if (!val) {
            Swal.fire({
                icon: "error",
                title: "Error",
                html: "You have to type something! (that includes letters)"
            });
            return;
        }
        Swal.fire({
            icon: "info",
            title: "Generating&hellip;",
            showConfirmButton: false,
            allowOutsideClick: false,
            allowEscapeKey: false,
            allowEnterKey: false
        });
        spell(val, $(".host-select").val());
    });
});