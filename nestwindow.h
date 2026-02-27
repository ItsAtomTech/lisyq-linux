#ifndef NESTWINDOW_H
#define NESTWINDOW_H

#include <QMainWindow>
#include <QKeyEvent> // Needed for QKeyEvent
class QWebEngineView;  // Forward declaration
#include <QFileDialog>

#include <QWebChannel>
#include <QObject>
#include <QLineEdit>
#include <QWidgetAction>

#include "PortManager.h"



QT_BEGIN_NAMESPACE
namespace Ui {
class NestWindow;
}
QT_END_NAMESPACE

class MainWindow;


class NestWindow : public QMainWindow
{
    Q_OBJECT

public:
    NestWindow(QWidget *parent = nullptr);
    ~NestWindow();


    QString data_string; //temp store for the data
    QString data_string_nt;
    QString SaveNestedTLPath;     // Stores last save path
    bool NTAsnew = true;          // Tracks if this is a new file

    // ================
    // File Management Vars Section
    // ================
    QString SavePath;
    bool FromOpenFile;
    bool asNew;

    void Open_FileDirectory_Native();

    void Save_File();

    void openFile();


    // ================
    // Ports and UDP Section
    // ================

    // Serial ports
    void addComPort(int index, const QString &portname);
    void removeComPort(int index);

    // UDP channels
    void addUdpChannel(int index, const QString &address, int port);
    void removeUdpChannel(int index);

    // JSON getters
    QString getSystemComPortsJson();
    QString getManagedPortsJson();
    QString getUdpListJson();


    void setDf(const QString &data);
    void outputs_v2();

    void saveFileNT();


    //Context Menus
    void Show_template_scriptmenu();



protected:
    void keyPressEvent(QKeyEvent *event);
    void resizeEvent(QResizeEvent *event) override;


private slots:
    void on_actionPort_Configuration_triggered();
    //TAB Buttons on Top
    void onTimelineClicked();
    void setActiveButton(QPushButton *active);

    void on_actionSave_triggered();

    //


    //Timeline Scrips Menu
    void onTemplateEditTimeline();
    void onTemplateRemove();
    void onTemplateCancel();

private:
    Ui::NestWindow *ui;
    QWebEngineView *devTools; // Make devTools a member so it doesn’t go out of scope

    //Tab Buttons
    QPushButton *btnTimeline;

    QWebEngineView *webView;
    PortManager *portManager;

    MainWindow* mainWindow;


    // ================
    // File Management Section End
    // ================

    // Bridge Inject
    void injectWebChannelScript();
    void initializeWebChannel();
    void onReady();


    // Context Menus
    QMenu *template_menu;


};




#endif // NESTWINDOW_H
