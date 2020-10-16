var currentAudio = false;

var spell = (word, host, callback) => {
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
            if (!callback) Swal.close();
            if (currentAudio) currentAudio.stop();
            $(".stop-audio").hide();
            if (!callback) currentAudio = new Howl({
                src: [output.url],
                format: ["mp3"],
                autoplay: true,
                onplay: () => $(".stop-audio").show(),
                onend: () => $(".stop-audio").hide()
            });
            var fn = "".concat(host, "_", word.replace(/ /g, "_"));
            if (callback) callback(output.blob, fn);
            else audio.download(output.blob, fn);
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
    $(".submit-all").on("click", () => {
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
        var zip = new JSZip();
        var done = 0;
        hosts.forEach((h) => {
            spell(val, h.id, (b, f) => {
                zip.file(f.concat(".mp3"), b);
                done++;
                if (done >= hosts.length) {
                    Swal.fire({
                        icon: "info",
                        title: "Zipping files&hellip;",
                        showConfirmButton: false,
                        allowOutsideClick: false,
                        allowEscapeKey: false,
                        allowEnterKey: false
                    });
                    zip.generateAsync({ type: "blob" })
                        .then((content) => {
                            Swal.close();
                            saveAs(content, "".concat("all_", val.replace(/ /g, "_"), ".zip"));
                        });
                }
            });
        });
    });
    $(".stop-audio").hide().on("click", () => {
        if (currentAudio) currentAudio.stop();
        $(".stop-audio").hide();
    });
});