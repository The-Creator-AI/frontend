import React, { useEffect, useState } from "react";
import { DraggableCore, DraggableEventHandler } from "react-draggable";
import { MdChevronRight } from "react-icons/md";
import "./FileExplorerSidebar.scss";

interface FileExplorerSidebarProps {
  sections: {
    id: string;
    title: string;
    content: React.ReactNode;
    collapsed: boolean;
    height: number;
  }[];
}

const FileExplorerSidebar = React.forwardRef<
  HTMLDivElement,
  FileExplorerSidebarProps
>((props: FileExplorerSidebarProps, ref) => {
  const [sections, setSections] = useState(props.sections);
  const sectionRefs = sections.map(() => React.createRef<HTMLDivElement>());

  // update sections on prop change
  useEffect(() => {
    setSections(props.sections);
  }, [props.sections]);

//   // If sections update, find the height of each section,
//   // if total height is shy of 100%, then add this to the last expanded section
//   useEffect(() => {
//     let sectionJustExpandedIndex = -1;
//     if (sectionRefs.length > 0 && ref) {
//         sectionRefs.forEach((ref, index) => {
//             const height = ref.current?.clientHeight || 0;
//             console.log({ height, originalHeight: sections[index].height });
//             if (!sections[index].collapsed && ref.current && height <=40) {
//                 ref.current.style.height = sections[index].height + "%";
//                 sectionJustExpandedIndex = index;
//             }
//         });
//       const containerHeight = (ref as any)?.current?.clientHeight;
//       const totalHeight = sectionRefs
//         .map((ref) => ref.current?.clientHeight)
//         .reduce((acc: any, curr: any) => (acc || 0) + (curr || 0), 0);
//       const totalHeightPercent = (totalHeight * 100) / containerHeight;
//       console.log({
//           totalHeight,
//           ref: (ref as any)?.current?.clientHeight,
//           totalHeightPercent,
//           sectionJustExpandedIndex
//       })
//     const lastExpandedSection = sectionRefs
//         .filter((ref, index) => !sections[index].collapsed && sectionJustExpandedIndex !== index)
//         .pop()?.current;
//     const lastExpandedSectionHeight = lastExpandedSection?.clientHeight || 0;
//     const lastExpandedSectionHeightPercent = (lastExpandedSectionHeight * 100) / containerHeight;
//     console.log({
//         lastExpandedSection,
//         lastExpandedSectionHeight,
//         lastExpandedSectionHeightPercent
//     });
//     if (lastExpandedSection) {
//         lastExpandedSection.style.height = `${
//         lastExpandedSectionHeightPercent +
//         (100 - totalHeightPercent)
//         }%`;
//     }
//     }
//   }, [sections]);

  const handleDrag = (e: any, data: any, index: number) => {
    const deltaY = data.deltaY;
    const sectionRef = sectionRefs[index].current;
    if (sectionRef) {
      sectionRef.style.height = `${sectionRef.clientHeight + deltaY}px`;
    }
  };

  const toggleSection = (index: number) => {
    setSections((prevSections) =>
      prevSections.map((section, i) => {
        if (i === index) {
          return { ...section, collapsed: !section.collapsed };
        }
        return section;
      })
    );
  };

  return (
    <div className="flie-explorer-sidebar" ref={ref}>
      {sections.map((section, index) => (
        <>
          <div
            key={section.id}
            className="section"
            style={{
              height: section.collapsed ? "40px" : `${section.height}%`,
            }}
            ref={sectionRefs[index]}
          >
            <div
              className="section-header"
              onClick={() => toggleSection(index)}
            >
              <span className={`arrow ${section.collapsed ? "" : "down"}`}>
                <MdChevronRight />
              </span>
              {section.title}
            </div>
            {!section.collapsed && (
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

export default FileExplorerSidebar;
