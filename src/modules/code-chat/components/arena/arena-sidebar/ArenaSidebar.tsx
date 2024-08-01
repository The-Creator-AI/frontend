import React, { useEffect, useState } from "react";
import { DraggableCore, DraggableEventHandler } from "react-draggable";
import { MdChevronRight } from "react-icons/md";
import "./ArenaSidebar.scss";
import useStore from "../../../../../state/useStore";
import { codeChatStore$ } from "../../../store/code-chat.store";
import { toggleSection } from "../../../store/code-chat.logic";

interface ArenaSidebarProps {
  sections: {
    id: string;
    title: string;
    content: React.ReactNode;
    collapsed: boolean;
    height: number;
  }[];
}

const ArenaSidebar = React.forwardRef<
  HTMLDivElement,
  ArenaSidebarProps
>((props: ArenaSidebarProps, ref) => {
  const [sections, setSections] = useState(props.sections);
  const sectionRefs = sections.map(() => React.createRef<HTMLDivElement>());
  const { collapsedSections } = useStore(codeChatStore$);

  // update sections on prop change
  useEffect(() => {
    setSections(props.sections);
  }, [props.sections]);

  const handleDrag = (e: any, data: any, index: number) => {
    const deltaY = data.deltaY;
    const sectionRef = sectionRefs[index].current;
    if (sectionRef) {
      sectionRef.style.height = `${sectionRef.clientHeight + deltaY}px`;
    }
  };

  const toggleSectionLocal = (index: number) => {
    const sectionId = sections[index].id;
    toggleSection(sectionId);
  };

  return (
    <div className="flie-explorer-sidebar" ref={ref}>
      {sections.map((section, index) => (
        <>
          <div
            key={section.id}
            className="section"
            style={{
              // height: collapsedSections[section.id] ? "40px" : `${section.height}%`,
              // flexGrow: collapsedSections[section.id] ? 0 : 1,
            }}
            ref={sectionRefs[index]}
          >
            <div
              className="section-header"
              onClick={() => toggleSectionLocal(index)}
            >
              <span className={`arrow ${collapsedSections?.[section.id] ? "" : "down"}`}>
                <MdChevronRight />
              </span>
              {section.title}
            </div>
            {!collapsedSections?.[section.id] && (
              <div className="section-content">{section.content}</div>
            )}
          </div>
          {index < sections.length - 1 && (
            <DraggableCore onDrag={(e, data) => handleDrag(e, data, index)}>
              <div className="section-resizer" />
            </DraggableCore>
          )}
        </>
      ))}
    </div>
  );
});

export default ArenaSidebar;

