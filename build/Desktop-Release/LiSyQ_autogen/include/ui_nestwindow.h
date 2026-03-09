/********************************************************************************
** Form generated from reading UI file 'nestwindow.ui'
**
** Created by: Qt User Interface Compiler version 6.10.2
**
** WARNING! All changes made in this file will be lost when recompiling UI file!
********************************************************************************/

#ifndef UI_NESTWINDOW_H
#define UI_NESTWINDOW_H

#include <QtCore/QVariant>
#include <QtGui/QAction>
#include <QtWidgets/QApplication>
#include <QtWidgets/QFrame>
#include <QtWidgets/QMainWindow>
#include <QtWidgets/QMenu>
#include <QtWidgets/QMenuBar>
#include <QtWidgets/QVBoxLayout>
#include <QtWidgets/QWidget>

QT_BEGIN_NAMESPACE

class Ui_NestWindow
{
public:
    QAction *actionNew;
    QAction *actionOpen;
    QAction *actionSettings_and_Option;
    QAction *actionSave;
    QAction *actionSave_As;
    QAction *actionPort_Configuration;
    QAction *actionDMX_Config_Patcher;
    QAction *actionImport_Templates;
    QAction *actionPlugin_Manager;
    QAction *actionSequence_File;
    QWidget *centralwidget;
    QVBoxLayout *verticalLayout;
    QFrame *mainFrame;
    QMenuBar *menubar;
    QMenu *menuFIle;
    QMenu *menuTools;
    QMenu *menuTimeline;

    void setupUi(QMainWindow *NestWindow)
    {
        if (NestWindow->objectName().isEmpty())
            NestWindow->setObjectName("NestWindow");
        NestWindow->resize(780, 616);
        NestWindow->setDocumentMode(false);
        NestWindow->setUnifiedTitleAndToolBarOnMac(false);
        actionNew = new QAction(NestWindow);
        actionNew->setObjectName("actionNew");
        actionOpen = new QAction(NestWindow);
        actionOpen->setObjectName("actionOpen");
        actionSettings_and_Option = new QAction(NestWindow);
        actionSettings_and_Option->setObjectName("actionSettings_and_Option");
        actionSave = new QAction(NestWindow);
        actionSave->setObjectName("actionSave");
        actionSave_As = new QAction(NestWindow);
        actionSave_As->setObjectName("actionSave_As");
        actionPort_Configuration = new QAction(NestWindow);
        actionPort_Configuration->setObjectName("actionPort_Configuration");
        actionDMX_Config_Patcher = new QAction(NestWindow);
        actionDMX_Config_Patcher->setObjectName("actionDMX_Config_Patcher");
        actionImport_Templates = new QAction(NestWindow);
        actionImport_Templates->setObjectName("actionImport_Templates");
        actionPlugin_Manager = new QAction(NestWindow);
        actionPlugin_Manager->setObjectName("actionPlugin_Manager");
        actionSequence_File = new QAction(NestWindow);
        actionSequence_File->setObjectName("actionSequence_File");
        centralwidget = new QWidget(NestWindow);
        centralwidget->setObjectName("centralwidget");
        verticalLayout = new QVBoxLayout(centralwidget);
        verticalLayout->setSpacing(2);
        verticalLayout->setObjectName("verticalLayout");
        verticalLayout->setContentsMargins(2, 2, 2, 2);
        mainFrame = new QFrame(centralwidget);
        mainFrame->setObjectName("mainFrame");
        mainFrame->setMinimumSize(QSize(0, 25));
        mainFrame->setFrameShape(QFrame::Shape::StyledPanel);
        mainFrame->setFrameShadow(QFrame::Shadow::Raised);

        verticalLayout->addWidget(mainFrame);

        NestWindow->setCentralWidget(centralwidget);
        menubar = new QMenuBar(NestWindow);
        menubar->setObjectName("menubar");
        menubar->setGeometry(QRect(0, 0, 780, 23));
        menubar->setDefaultUp(false);
        menubar->setNativeMenuBar(false);
        menuFIle = new QMenu(menubar);
        menuFIle->setObjectName("menuFIle");
        menuTools = new QMenu(menubar);
        menuTools->setObjectName("menuTools");
        menuTimeline = new QMenu(menubar);
        menuTimeline->setObjectName("menuTimeline");
        NestWindow->setMenuBar(menubar);

        menubar->addAction(menuFIle->menuAction());
        menubar->addAction(menuTools->menuAction());
        menubar->addAction(menuTimeline->menuAction());
        menuFIle->addAction(actionOpen);
        menuFIle->addAction(actionSettings_and_Option);
        menuFIle->addAction(actionSave);
        menuFIle->addAction(actionSave_As);
        menuTools->addAction(actionPort_Configuration);
        menuTimeline->addAction(actionSequence_File);

        retranslateUi(NestWindow);

        QMetaObject::connectSlotsByName(NestWindow);
    } // setupUi

    void retranslateUi(QMainWindow *NestWindow)
    {
        NestWindow->setWindowTitle(QCoreApplication::translate("NestWindow", "LiSyQ - Nest.in v1.2 (Linux Edition)", nullptr));
        actionNew->setText(QCoreApplication::translate("NestWindow", "New", nullptr));
        actionOpen->setText(QCoreApplication::translate("NestWindow", "Open", nullptr));
        actionSettings_and_Option->setText(QCoreApplication::translate("NestWindow", "Settings and Option", nullptr));
        actionSave->setText(QCoreApplication::translate("NestWindow", "Save", nullptr));
        actionSave_As->setText(QCoreApplication::translate("NestWindow", "Save As", nullptr));
        actionPort_Configuration->setText(QCoreApplication::translate("NestWindow", "Port Configuration", nullptr));
        actionDMX_Config_Patcher->setText(QCoreApplication::translate("NestWindow", "DMX Config Patcher", nullptr));
        actionImport_Templates->setText(QCoreApplication::translate("NestWindow", "Import Templates", nullptr));
        actionPlugin_Manager->setText(QCoreApplication::translate("NestWindow", "Plugin Manager", nullptr));
        actionSequence_File->setText(QCoreApplication::translate("NestWindow", "Add a Sequence File", nullptr));
        menuFIle->setTitle(QCoreApplication::translate("NestWindow", "File", nullptr));
        menuTools->setTitle(QCoreApplication::translate("NestWindow", "Tools", nullptr));
        menuTimeline->setTitle(QCoreApplication::translate("NestWindow", "Timeline", nullptr));
    } // retranslateUi

};

namespace Ui {
    class NestWindow: public Ui_NestWindow {};
} // namespace Ui

QT_END_NAMESPACE

#endif // UI_NESTWINDOW_H
