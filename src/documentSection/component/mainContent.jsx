import React, { useEffect, useRef, useState } from "react";
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import LinkTool from "@editorjs/link";
import RawTool from "@editorjs/raw";
import Checklist from "@editorjs/checklist";
import List from "@editorjs/list";
import Quote from "@editorjs/quote";
import Embed from "@editorjs/embed";
import Warning from "@editorjs/warning";

export default function MainContent() {
    const editorInstance = useRef(null);

    useEffect(() => {
        editorInstance.current = new EditorJS({
            holder: "editorjs",
            tools: {
                header: Header,
                linkTool: {
                    class: LinkTool,
                    config: {
                        endpoint: "http://localhost:8008/fetchUrl",
                    },
                },
                raw: { class: RawTool, config: {} },
                checklist: {
                    class: Checklist,
                },
                list: {
                    class: List,
                    inlineToolbar: true,
                    config: {
                        defaultStyle: "ordered",
                    },
                },
                quote: {
                    class: Quote,
                    inlineToolbar: true,
                    shortcut: "CMD+SHIFT+O",
                    config: {
                        quotePlaceholder: "Enter a quote",
                        captionPlaceholder: "Quote's author",
                    },
                },
                embed: {
                    class: Embed,
                    config: {
                        // services: {
                        //     youtube: true,
                        //     coub: true,
                        // },
                    },
                },
                warning: Warning,
            },
        });

        return () => {
            editorInstance.current.destroy();
        };
    }, []);

    return (
        <div className="w-full mx-auto overflow-y-auto overflow-x-hidden hide-scrollbars-element">
            <div id="editorjs" className="sm:container"></div>
        </div>
    );
}
