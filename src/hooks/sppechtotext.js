export function startspeechToText(stream, initiator, websocket) {
    // const websocket = new WebSocket("wss://callapp.iotcom.io/socket");
    websocket.onmessage = (msg) => {
        //console.log(JSON.parse(msg.data));
        const text = JSON.parse(msg.data);
        console.log('text is in func stt', text);
        //console.log("fixed text",agentText);
        //recgtext.value = agentText + text.data;
        console.log(text.isFixed);
        if (text.isFixed === "true" || text.isFixed === true) {
            if (initiator === "Agent") {
                agentText = agentText + text.data;


            } else if (initiator === "Customer") {
                // customerText = customerText + text.data;
            } else { console.log("not a valid initiator"); }

            // console.log("new final Data", text.data);
            // console.log('Updated agentText:', agentText);
        } else {
            if (initiator === "Agent") {
                // agentText = agentText + text.data;
                // recgtext.value = agentText + text.data;
            } else if (initiator === "Customer") {
                // customerText = customerText + text.data;
                // recgtext1.value = customerText + text.data;
            } else { console.log("not a valid initiator"); }
        };
    };

    const mediaRecorder = new MediaRecorder(stream, {
        //audioBitsPerSecond: 8000 * 16,
        mimeType: "audio/webm;codecs=opus",
    });

    mediaRecorder.ondataavailable = (event) => {
        //console.log(event);
        if (event.data.size > 0) {
            console.log('event data is ', event.data);

            websocket.send(event.data);
            //socket.send(JSON.stringify({'video': event.data}));
            //chunks.push(event.data);
        } else {
            console.log("event in event data is else block ", event);
            console.log("event.data", event.data);
        };
    };

    mediaRecorder.onstop = async () => {
        const Tracks = await stream.getAudioTracks();
        console.log(Tracks);
        Tracks.forEach((track) => {
            console.log(track.getSettings());
            track.stop();
        });
    };

    mediaRecorder.start(1000);

    return {
        mediaRecorder,
        websocket,
        stop: () => {
            mediaRecorder.stop();
            websocket.close();
            console.log("stopped socket and media recorder");
        },
    };
};



export function stopSpeechTotext(mediaRecorder, websocket) {
    mediaRecorder.stop();
    //websocket.close(1000, "Closing connection gracefully");
    websocket.send(JSON.stringify("streamClose"));
    websocket.close();
};